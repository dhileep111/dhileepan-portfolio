/**
 * Limits for the site checker. Two layers, both per visitor (hashed IP):
 *
 *  1. Completed checks: 5 per clock hour. A slot is RESERVED when a check starts and RELEASED
 *     again if the check fails, so only successful checks use up the allowance. A mistyped
 *     address never costs a slot.
 *  2. Attempts: 15 per rolling hour, counted always. Failed checks still cost PageSpeed quota,
 *     so this stops someone looping bad addresses to burn it.
 *
 * Counters live in Upstash Redis when configured (shared across serverless instances) and fall
 * back to in-memory maps otherwise (local dev: per-instance, best effort).
 */
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

export const CHECKS_PER_HOUR = 5;
export const ATTEMPTS_PER_HOUR = 15;

const HOUR_MS = 3_600_000;
const SLOT_TTL_SECONDS = 7200; // a slot key outlives its hour so a late release still lands

export type Reservation =
  | { ok: true; slotKey: string; remaining: number }
  | { ok: false; reason: "attempts" | "checks"; resetSeconds: number };

/* ----------------------------- in-memory fallback ----------------------------- */

const memory = new Map<string, { count: number; expiresAt: number }>();

function memAdd(key: string, ttlSeconds: number, delta: number): number {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.expiresAt <= now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.expiresAt <= now) {
    const count = Math.max(0, delta);
    memory.set(key, { count, expiresAt: now + ttlSeconds * 1000 });
    return count;
  }
  entry.count = Math.max(0, entry.count + delta);
  return entry.count;
}

function memGet(key: string): number {
  const e = memory.get(key);
  return e && e.expiresAt > Date.now() ? e.count : 0;
}

/* --------------------------------- counters ---------------------------------- */

async function slotAdd(key: string, delta: 1 | -1): Promise<number> {
  const redis = getRedis();
  if (redis) {
    try {
      if (delta === 1) {
        const n = await redis.incr(key);
        if (n === 1) await redis.expire(key, SLOT_TTL_SECONDS);
        return n;
      }
      const n = await redis.decr(key);
      if (n < 0) {
        await redis.set(key, 0, { ex: SLOT_TTL_SECONDS });
        return 0;
      }
      return n;
    } catch (err) {
      console.error("Slot counter failed, using in-memory fallback:", err);
    }
  }
  return memAdd(key, SLOT_TTL_SECONDS, delta);
}

let attemptsLimiter: Ratelimit | undefined;

async function attemptAllowed(idHash: string): Promise<{ ok: boolean; resetSeconds: number }> {
  const redis = getRedis();
  if (redis) {
    try {
      attemptsLimiter ??= new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(ATTEMPTS_PER_HOUR, "3600 s"),
        prefix: "sitecheck:attempts",
      });
      const r = await attemptsLimiter.limit(idHash);
      return { ok: r.success, resetSeconds: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    } catch (err) {
      console.error("Attempts limiter failed, using in-memory fallback:", err);
    }
  }
  const n = memAdd(`attempts:${idHash}`, 3600, 1);
  return { ok: n <= ATTEMPTS_PER_HOUR, resetSeconds: 3600 };
}

/* ---------------------------------- public ----------------------------------- */

const bucket = () => Math.floor(Date.now() / HOUR_MS);
const secondsToNextHour = () => Math.max(1, Math.ceil(((bucket() + 1) * HOUR_MS - Date.now()) / 1000));

/** Reserve one completed-check slot. Call releaseCheck() if the check does not succeed. */
export async function reserveCheck(idHash: string): Promise<Reservation> {
  const attempt = await attemptAllowed(idHash);
  if (!attempt.ok) return { ok: false, reason: "attempts", resetSeconds: attempt.resetSeconds };

  const slotKey = `sitecheck:ok:${idHash}:${bucket()}`;
  const count = await slotAdd(slotKey, 1);
  if (count > CHECKS_PER_HOUR) {
    await slotAdd(slotKey, -1);
    return { ok: false, reason: "checks", resetSeconds: secondsToNextHour() };
  }
  return { ok: true, slotKey, remaining: CHECKS_PER_HOUR - count };
}

/** Give a reserved slot back (the check failed or never started). */
export async function releaseCheck(slotKey: string | undefined): Promise<void> {
  if (!slotKey) return;
  await slotAdd(slotKey, -1);
}

/** How many completed checks this visitor has left this hour (does not use one). */
export async function peekRemaining(idHash: string): Promise<number> {
  const key = `sitecheck:ok:${idHash}:${bucket()}`;
  const redis = getRedis();
  if (redis) {
    try {
      const n = Number((await redis.get<number>(key)) ?? 0);
      return Math.max(0, CHECKS_PER_HOUR - n);
    } catch {
      /* fall through to memory */
    }
  }
  return Math.max(0, CHECKS_PER_HOUR - memGet(key));
}
