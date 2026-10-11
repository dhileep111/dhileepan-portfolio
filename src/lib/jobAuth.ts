/**
 * Signs a check job so the public background-function URL can't be used to run
 * arbitrary checks (and burn PageSpeed quota) without going through /api/check.
 * Uses the PageSpeed API key itself as the HMAC secret, so no extra variable is needed.
 */
const enc = new TextEncoder();

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function signJob(id: string, url: string, secret: string) {
  return hmac(`job:${id}:${url}`, secret);
}

export async function verifyJob(id: string, url: string, token: string, secret: string) {
  const expected = await signJob(id, url, secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

/** Short stable hash, used for cache keys and to avoid storing raw IPs. */
export async function shortHash(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
