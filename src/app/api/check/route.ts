import { NextResponse } from "next/server";
import { hashIp, rateLimit } from "@/lib/rateLimit";
import { normalizeUrl, summarize, type SiteCheckResult } from "@/lib/siteCheck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // PageSpeed runs take 10–40 seconds

const LIMIT = 5; // fresh checks per visitor...
const WINDOW_SECONDS = 60 * 60; // ...per hour
const CACHE_SECONDS = 10 * 60;
const cache = new Map<string, { at: number; data: SiteCheckResult }>();

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

type PsiError = { error?: { code?: number; message?: string; errors?: { reason?: string }[] } };
type PsiResponse = PsiError & {
  lighthouseResult?: Parameters<typeof summarize>[0] & {
    runtimeError?: { code?: string; message?: string };
    finalDisplayedUrl?: string;
  };
};

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

  // Recent identical checks cost nothing and don't count against the visitor's limit.
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_SECONDS * 1000) {
    return json({ result: hit.data, cached: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = await rateLimit(`sitecheck:${await hashIp(ip)}`, LIMIT, WINDOW_SECONDS);
  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.resetSeconds / 60));
    return json(
      { error: `You've run the maximum number of checks for now. Please try again in about ${mins} minutes.` },
      429,
      { "Retry-After": String(rl.resetSeconds) },
    );
  }

  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  for (const c of ["PERFORMANCE", "SEO", "ACCESSIBILITY"]) endpoint.searchParams.append("category", c);
  endpoint.searchParams.set("key", apiKey);

  let psi: PsiResponse;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(55_000), cache: "no-store" });
    psi = (await res.json()) as PsiResponse;
    if (!res.ok || psi.error) {
      const code = psi.error?.code ?? res.status;
      const reason = psi.error?.errors?.[0]?.reason ?? "";
      if (/api key|keyInvalid|API_KEY|not been used|disabled|PERMISSION_DENIED/i.test(`${psi.error?.message} ${reason}`)) {
        // Server-side misconfiguration: don't blame the visitor's URL.
        console.error("PageSpeed API key problem:", psi.error?.message);
        return json({ error: "The site checker isn't available right now. Please try again later." }, 503);
      }
      if (code === 429 || reason === "rateLimitExceeded" || reason === "quotaExceeded") {
        return json({ error: "The checker is very busy right now. Please try again in a few minutes." }, 503);
      }
      if (code === 400 || /FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|invalid/i.test(psi.error?.message ?? "")) {
        return json(
          { error: "We couldn't load that page. Check the address, and that the site is public and online." },
          422,
        );
      }
      return json({ error: "The speed test failed. Please try again in a moment." }, 502);
    }
  } catch {
    return json({ error: "The test took too long. Please try again." }, 504);
  }

  const lh = psi.lighthouseResult;
  if (!lh || lh.runtimeError?.code) {
    const code = lh?.runtimeError?.code ?? "";
    if (/FAILED_DOCUMENT_REQUEST|DNS_FAILURE|ERRORED_DOCUMENT_REQUEST|NO_FCP|NO_LCP/.test(code)) {
      return json(
        { error: "We couldn't load that page. Check the address, and that the site is public and online." },
        422,
      );
    }
    return json({ error: "The speed test couldn't complete for that page." }, 502);
  }

  const result = summarize(lh, lh.finalDisplayedUrl ?? url);
  cache.set(url, { at: Date.now(), data: result });
  if (cache.size > 100) cache.delete(cache.keys().next().value as string);
  return json({ result, cached: false, remaining: rl.remaining });
}
