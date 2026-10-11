/**
 * Netlify background function (the "-background" suffix gives it up to 15 minutes).
 * Called only by /api/check with a signed token. Runs the PageSpeed test and stores the
 * outcome in Upstash Redis, where the page polls for it.
 *
 * On success the visitor's slot stays used and the result is cached for an hour.
 * On any failure the slot is given back. Either way the "in flight" marker for the URL is cleared.
 */
import { shortHash, verifyJob } from "../../src/lib/jobAuth";
import { runPageSpeed } from "../../src/lib/psi";
import { releaseCheck } from "../../src/lib/rateLimit";
import { getRedis } from "../../src/lib/redis";

const JOB_SECONDS = 15 * 60;
const CACHE_SECONDS = 60 * 60;

type Job = { status: string; url: string; slotKey?: string };

export default async (req: Request) => {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const redis = getRedis();
  if (!apiKey || !redis) return new Response("not configured", { status: 500 });

  let body: { id?: string; url?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const { id, url, token } = body;
  if (!id || !url || !token) return new Response("bad request", { status: 400 });
  if (!(await verifyJob(id, url, token, apiKey))) return new Response("forbidden", { status: 403 });

  // Single use: only a job still marked pending, created by /api/check, can run.
  const key = `job:${id}`;
  const job = await redis.get<Job>(key);
  if (!job || job.status !== "pending" || job.url !== url) return new Response("gone", { status: 410 });
  const slotKey = job.slotKey;
  await redis.set(key, { status: "running", url, slotKey }, { ex: JOB_SECONDS });

  const urlHash = await shortHash(url);
  const inflightKey = `inflight:${urlHash}`;
  try {
    const out = await runPageSpeed(url, apiKey, 120_000);
    if (out.ok) {
      await redis.set(`result:${urlHash}`, out.result, { ex: CACHE_SECONDS });
      await redis.set(key, { status: "done", url, slotKey, result: out.result }, { ex: JOB_SECONDS });
    } else {
      await releaseCheck(slotKey);
      await redis.set(key, { status: "error", url, slotKey, error: out.message }, { ex: JOB_SECONDS });
    }
  } catch (err) {
    // Never leave the visitor's slot or the URL stuck because of an unexpected crash.
    console.error("Background check crashed:", err);
    await releaseCheck(slotKey).catch(() => undefined);
    await redis
      .set(key, { status: "error", url, slotKey, error: "The check failed unexpectedly. Please try again." }, { ex: JOB_SECONDS })
      .catch(() => undefined);
  } finally {
    // Clear the marker only if it still belongs to this job.
    try {
      if ((await redis.get<string>(inflightKey)) === id) await redis.del(inflightKey);
    } catch {
      /* the marker expires on its own */
    }
  }
  return new Response("ok");
};
