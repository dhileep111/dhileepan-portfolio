import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/** Upstash Redis over REST, or null when it isn't configured (dev, or not set up yet). */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
