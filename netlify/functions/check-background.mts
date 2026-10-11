/**
 * Netlify background function (the "-background" suffix gives it up to 15 minutes).
 * Called only by /api/check with a signed token. Runs the PageSpeed test and stores the
 * outcome in Upstash Redis, where the page polls for it.
 */
import { shortHash, verifyJob } from "../../src/lib/jobAuth";
import { runPageSpeed } from "../../src/lib/psi";
import { getRedis } from "../../src/lib/redis";

const JOB_SECONDS = 15 * 60;
const CACHE_SECONDS = 60 * 60;

type Job = { status: string; url: string };

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
  await redis.set(key, { status: "running", url }, { ex: JOB_SECONDS });

  const out = await runPageSpeed(url, apiKey, 120_000);
  if (out.ok) {
    await redis.set(key, { status: "done", url, result: out.result }, { ex: JOB_SECONDS });
    await redis.set(`result:${await shortHash(url)}`, out.result, { ex: CACHE_SECONDS });
  } else {
    await redis.set(key, { status: "error", url, error: out.message }, { ex: JOB_SECONDS });
  }
  return new Response("ok");
};
