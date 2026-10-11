/**
 * Rate limiter.
 *  - With Upstash Redis configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) it uses
 *    @upstash/ratelimit, so the limit holds across every serverless instance.
 *  - Otherwise it falls back to an in-memory map, which only limits requests that land on the
 *    same warm instance. That is a best-effort guard for local dev, not a real cap.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

export type RateResult = { ok: boolean; remaining: number; resetSeconds: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSec: number): RateResult {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, resetSeconds: windowSec };
  }
  entry.count += 1;
  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

let limiter: Ratelimit | undefined;

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  const redis = getRedis();
  if (redis) {
    try {
      limiter ??= new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: "sitecheck",
      });
      const r = await limiter.limit(key);
      return {
        ok: r.success,
        remaining: r.remaining,
        resetSeconds: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)),
      };
    } catch (err) {
      console.error("Upstash rate limit failed, using in-memory fallback:", err);
    }
  }
  return memoryLimit(key, limit, windowSec);
}
