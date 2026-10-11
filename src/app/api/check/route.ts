import { NextResponse } from "next/server";
import { shortHash, signJob } from "@/lib/jobAuth";
import { runPageSpeed } from "@/lib/psi";
import { rateLimit } from "@/lib/rateLimit";
import { getRedis } from "@/lib/redis";
import { normalizeUrl, type SiteCheckResult } from "@/lib/siteCheck";

/**
 * POST /api/check  { url }
 *   -> 200 { status:"done", result }     (cached, or run inline outside Netlify)
 *   -> 202 { status:"pending", id }      (job started in a Netlify background function)
 * GET  /api/check?id=...
 *   -> { status:"pending" } | { status:"done", result } | { status:"error", error }
 *
 * A PageSpeed run takes 10-60 s, longer than a normal Netlify function may run, so on Netlify the
 * work happens in netlify/functions/check-background.mts and the page polls for the result.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LIMIT = 5; // fresh checks per visitor...
const WINDOW_SECONDS = 60 * 60; // ...per hour
const CACHE_SECONDS = 60 * 60; // the same URL is reused for an hour
const JOB_SECONDS = 15 * 60;

// Fallback cache when Redis isn't configured (local dev).
const memoryCache = new Map<string, { at: number; data: SiteCheckResult }>();

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return json({ error: "The site checker isn't configured yet. Please try again later." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send the website address as JSON." }, 400);
  }
  const parsed = normalizeUrl((body as { url?: unknown } | null)?.url);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const url = parsed.url;

  const redis = getRedis();
  const cacheKey = `result:${await shortHash(url)}`;

  // Repeat checks of the same address are free and don't count against the visitor's limit.
  if (redis) {
    try {
      const cached = await redis.get<SiteCheckResult>(cacheKey);
      if (cached) return json({ status: "done", result: cached, cached: true });
    } catch (err) {
      console.error("Cache read failed:", err);
    }
  } else {
    const hit = memoryCache.get(url);
    if (hit && Date.now() - hit.at < CACHE_SECONDS * 1000) {
      return json({ status: "done", result: hit.data, cached: true });
    }
  }

  // Netlify puts the visitor's address in x-nf-client-connection-ip; the others are fallbacks.
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = await rateLimit(`ip:${await shortHash(`sitecheck:${ip}`)}`, LIMIT, WINDOW_SECONDS);
  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.resetSeconds / 60));
    return json(
      { error: `You've run the maximum number of checks for now. Please try again in about ${mins} minutes.` },
      429,
      { "Retry-After": String(rl.resetSeconds) },
    );
  }

  const onNetlify = request.headers.has("x-nf-request-id");
  if (redis && onNetlify) {
    const id = crypto.randomUUID();
    try {
      await redis.set(`job:${id}`, { status: "pending", url }, { ex: JOB_SECONDS });
      const token = await signJob(id, url, apiKey);
      const origin = new URL(request.url).origin;
      const res = await fetch(`${origin}/.netlify/functions/check-background`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, url, token }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.status !== 202 && !res.ok) throw new Error(`background function answered ${res.status}`);
      return json({ status: "pending", id }, 202);
    } catch (err) {
      console.error("Could not start background check:", err);
      return json({ error: "The checker couldn't start. Please try again in a moment." }, 502);
    }
  }

  // No background runner (local dev, or Upstash not set up): run inline. Fast sites only on Netlify.
  const out = await runPageSpeed(url, apiKey, 55_000);
  if (!out.ok) return json({ error: out.message }, out.status);
  if (redis) {
    redis.set(cacheKey, out.result, { ex: CACHE_SECONDS }).catch(() => undefined);
  } else {
    memoryCache.set(url, { at: Date.now(), data: out.result });
    if (memoryCache.size > 100) memoryCache.delete(memoryCache.keys().next().value as string);
  }
  return json({ status: "done", result: out.result, cached: false });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "That check isn't valid." }, 400);
  const redis = getRedis();
  if (!redis) return json({ error: "The site checker isn't configured yet." }, 503);

  let job: { status: string; url?: string; result?: SiteCheckResult; error?: string } | null;
  try {
    job = await redis.get(`job:${id}`);
  } catch (err) {
    console.error("Job read failed:", err);
    return json({ error: "Couldn't read the result. Please try again." }, 502);
  }
  if (!job) return json({ error: "This check expired. Please run it again." }, 404);
  if (job.status === "done" && job.result) return json({ status: "done", result: job.result });
  if (job.status === "error") return json({ status: "error", error: job.error ?? "The check failed." });
  return json({ status: "pending" });
}
