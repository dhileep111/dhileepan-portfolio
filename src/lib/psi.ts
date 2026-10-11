import { summarize, type SiteCheckResult } from "./siteCheck";

export type PsiOutcome =
  | { ok: true; result: SiteCheckResult }
  | { ok: false; status: number; message: string };

type PsiResponse = {
  error?: { code?: number; message?: string; errors?: { reason?: string }[] };
  lighthouseResult?: Parameters<typeof summarize>[0] & {
    runtimeError?: { code?: string; message?: string };
    finalDisplayedUrl?: string;
  };
};

const CANT_LOAD = "We couldn't load that page. Check the address, and that the site is public and online.";

/** Calls Google PageSpeed Insights and turns the outcome into a result or a friendly error. */
export async function runPageSpeed(url: string, apiKey: string, timeoutMs: number): Promise<PsiOutcome> {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  for (const c of ["PERFORMANCE", "SEO", "ACCESSIBILITY"]) endpoint.searchParams.append("category", c);
  endpoint.searchParams.set("key", apiKey);

  let psi: PsiResponse;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
    const text = await res.text();
    try {
      psi = JSON.parse(text) as PsiResponse;
    } catch {
      return { ok: false, status: 502, message: "The speed test returned an unexpected answer. Please try again." };
    }
    if (!res.ok || psi.error) {
      const code = psi.error?.code ?? res.status;
      const reason = psi.error?.errors?.[0]?.reason ?? "";
      const msg = psi.error?.message ?? "";
      if (/api key|keyInvalid|API_KEY|not been used|disabled|PERMISSION_DENIED/i.test(`${msg} ${reason}`)) {
        // Server-side misconfiguration: don't blame the visitor's URL.
        console.error("PageSpeed API key problem:", msg);
        return { ok: false, status: 503, message: "The site checker isn't available right now. Please try again later." };
      }
      if (code === 429 || reason === "rateLimitExceeded" || reason === "quotaExceeded") {
        return { ok: false, status: 503, message: "The checker is very busy right now. Please try again in a few minutes." };
      }
      if (code === 400 || /FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|DNS_FAILURE|NO_FCP|invalid/i.test(msg)) {
        return { ok: false, status: 422, message: CANT_LOAD };
      }
      return { ok: false, status: 502, message: "The speed test failed. Please try again in a moment." };
    }
  } catch {
    return { ok: false, status: 504, message: "The test took too long. Please try again." };
  }

  const lh = psi.lighthouseResult;
  if (!lh || lh.runtimeError?.code) {
    const code = lh?.runtimeError?.code ?? "";
    if (/FAILED_DOCUMENT_REQUEST|DNS_FAILURE|ERRORED_DOCUMENT_REQUEST|NO_FCP|NO_LCP/.test(code)) {
      return { ok: false, status: 422, message: CANT_LOAD };
    }
    return { ok: false, status: 502, message: "The speed test couldn't complete for that page." };
  }
  return { ok: true, result: summarize(lh, lh.finalDisplayedUrl ?? url) };
}
