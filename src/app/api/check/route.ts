import { NextResponse } from "next/server";
import { shortHash, signJob } from "@/lib/jobAuth";
import { runPageSpeed } from "@/lib/psi";
import { CHECKS_PER_HOUR, peekRemaining, releaseCheck, reserveCheck } from "@/lib/rateLimit";
import { getRedis } from "@/lib/redis";
import { normalizeUrl, type SiteCheckResult } from "@/lib/siteCheck";

/**
 * POST /api/check  { url }
 *   -> 200 { status:"done", result }     (cached, or run inline outside Netlify)
 *   -> 202 { status:"pending", id }      (new job, or attached to the same URL's running job)
 * GET  /api/check?id=...
 *   -> { status:"pending" } | { status:"done", result } | { status:"error", error }
 * GET  /api/check?quota=1
 *   -> { remaining, limit }              (completed checks left this hour; uses none)
 *
 * A PageSpeed run takes 10-120 s, longer than a normal Netlify function may run, so on Netlify the
 * work happens in netlify/functions/check-background.mts and the page polls for the result.
 *
 * Rules: only a SUCCESSFUL check uses one of the visitor's slots (reserved on start, released on
 * failure); identical in-flight URLs share one job; finished results are cached for an hour.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CACHE_SECONDS = 60 * 60;
const JOB_SECONDS = 15 * 60;
const INFLIGHT_SECONDS = 4 * 60; // shorter than JOB_SECONDS so a crashed job frees its URL sooner

// Fallback cache when Redis isn't configured (local dev).
const memoryCache = new Map<string, { at: number; data: SiteCheckResult }>();

type Job = { status: string; url: string; slotKey?: string; result?: SiteCheckResult; error?: string };

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

async function visitorHash(request: Request) {
  // Netlify puts the visitor's address in x-nf-client-connection-ip; the others are fallbacks.
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return shortHash(`sitecheck:${ip}`);
}

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
  const urlHash = await shortHash(url);
  const cacheKey = `result:${urlHash}`;
  const inflightKey = `inflight:${urlHash}`;

  if (redis) {
    try {
      // 1. Recently finished: free and instant, uses no slot.
      const cached = await redis.get<SiteCheckResult>(cacheKey);
      if (cached) return json({ status: "done", result: cached, cached: true });

      // 2. Same URL already being checked: attach to that job, uses no slot.
      const runningId = await redis.get<string>(inflightKey);
      if (runningId) {
        const running = await redis.get<Job>(`job:${runningId}`);
        if (running?.status === "done" && running.result) {
          return json({ status: "done", result: running.result, cached: true });
        }
        if (running && (running.status === "pending" || running.status === "running")) {
          return json({ status: "pending", id: runningId, attached: true }, 202);
        }
        await redis.del(inflightKey); // stale marker (job expired or failed)
      }
    } catch (err) {
      console.error("Cache/in-flight lookup failed:", err);
    }
  } else {
    const hit = memoryCache.get(url);
    if (hit && Date.now() - hit.at < CACHE_SECONDS * 1000) {
      return json({ status: "done", result: hit.data, cached: true });
    }
  }

  // 3. A genuinely new check: reserve one slot (released again if it fails).
  const who = await visitorHash(request);
  const slot = await reserveCheck(who);
  if (!slot.ok) {
    const mins = Math.max(1, Math.ceil(slot.resetSeconds / 60));
    const error =
      slot.reason === "checks"
        ? `You've used your ${CHECKS_PER_HOUR} free checks for this hour. Please try again in about ${mins} minutes.`
        : `Too many attempts in a short time. Please try again in about ${mins} minutes.`;
    return json({ error }, 429, { "Retry-After": String(slot.resetSeconds) });
  }

  const onNetlify = request.headers.has("x-nf-request-id");
  if (redis && onNetlify) {
    const id = crypto.randomUUID();
    try {
      // Claim the URL; if another request won the race, share its job and give our slot back.
      const won = await redis.set(inflightKey, id, { nx: true, ex: INFLIGHT_SECONDS });
      if (!won) {
        await releaseCheck(slot.slotKey);
        const otherId = await redis.get<string>(inflightKey);
        if (otherId) return json({ status: "pending", id: otherId, attached: true }, 202);
        return json({ error: "Please try again in a moment." }, 503);
      }
      const job: Job = { status: "pending", url, slotKey: slot.slotKey };
      await redis.set(`job:${id}`, job, { ex: JOB_SECONDS });
      const token = await signJob(id, url, apiKey);
      const origin = new URL(request.url).origin;
      const res = await fetch(`${origin}/.netlify/functions/check-background`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, url, token }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.status !== 202 && !res.ok) throw new Error(`background function answered ${res.status}`);
      return json({ status: "pending", id, remaining: slot.remaining }, 202);
    } catch (err) {
      console.error("Could not start background check:", err);
      await releaseCheck(slot.slotKey);
      await redis.del(inflightKey).catch(() => undefined);
      return json({ error: "The checker couldn't start. Please try again in a moment." }, 502);
    }
  }

  // No background runner (local dev, or Upstash not set up): run inline. On Netlify a function is
  // cut off at about 30 s, so give up a little earlier and show our own message, not a gateway error.
  const out = await runPageSpeed(url, apiKey, onNetlify ? 24_000 : 55_000);
  if (!out.ok) {
    await releaseCheck(slot.slotKey);
    if (out.status === 504 && onNetlify && !redis) {
      return json(
        { error: "This site takes too long to test right now. The checker's storage isn't set up yet, so only quick tests can run." },
        503,
      );
    }
    return json({ error: out.message }, out.status);
  }
  if (redis) {
    redis.set(cacheKey, out.result, { ex: CACHE_SECONDS }).catch(() => undefined);
  } else {
    memoryCache.set(url, { at: Date.now(), data: out.result });
    if (memoryCache.size > 100) memoryCache.delete(memoryCache.keys().next().value as string);
  }
  return json({ status: "done", result: out.result, cached: false, remaining: slot.remaining });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  if (params.get("quota")) {
    const remaining = await peekRemaining(await visitorHash(request));
    return json({ remaining, limit: CHECKS_PER_HOUR });
  }

  const id = params.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "That check isn't valid." }, 400);
  const redis = getRedis();
  if (!redis) return json({ error: "The site checker isn't configured yet." }, 503);

  let job: Job | null;
  try {
    job = await redis.get<Job>(`job:${id}`);
  } catch (err) {
    console.error("Job read failed:", err);
    return json({ error: "Couldn't read the result. Please try again." }, 502);
  }
  if (!job) return json({ error: "This check expired. Please run it again." }, 404);
  if (job.status === "done" && job.result) return json({ status: "done", result: job.result });
  if (job.status === "error") return json({ status: "error", error: job.error ?? "The check failed." });
  return json({ status: "pending" });
}
