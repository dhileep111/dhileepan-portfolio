/**
 * Small rate limiter.
 *  - If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set (free Upstash database,
 *    or the Vercel Marketplace Redis integration), counts are shared across all serverless
 *    instances, so the limit holds.
 *  - Otherwise it falls back to an in-memory map. That only limits requests that land on the
 *    same warm instance, so it is a best-effort guard, not a hard cap.
 */

type Result = { ok: boolean; remaining: number; resetSeconds: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSec: number): Result {
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

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<Result | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["TTL", key]]),
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: number }[];
    const count = Number(data[0]?.result ?? 0);
    let ttl = Number(data[1]?.result ?? -1);
    if (ttl < 0) {
      // First hit in the window (or a key that lost its expiry): set it.
      await fetch(`${base.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["EXPIRE", key, windowSec]]),
        signal: AbortSignal.timeout(2500),
      });
      ttl = windowSec;
    }
    return { ok: count <= limit, remaining: Math.max(0, limit - count), resetSeconds: ttl };
  } catch {
    return null; // fall back to memory if Redis is unreachable
  }
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<Result> {
  return (await upstashLimit(key, limit, windowSec)) ?? memoryLimit(key, limit, windowSec);
}

/** Hash the visitor's IP so raw addresses are never stored. */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`sitecheck:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
