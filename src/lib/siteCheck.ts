/**
 * Site-check helpers: URL validation and turning a Lighthouse/PageSpeed result into
 * plain-language findings. Shared by the API route and the results UI (types only).
 */

export type Status = "pass" | "warn" | "fail";

export type Check = { id: string; label: string; status: Status; detail: string };

export type SiteCheckResult = {
  url: string;
  checkedAt: string;
  scores: { performance: number | null; seo: number | null };
  speed: {
    seconds: number | null;
    status: Status;
    headline: string;
    detail: string;
  };
  stability: { status: Status; detail: string };
  responsiveness: { status: Status; detail: string };
  pageWeightMb: number | null;
  mobile: { status: Status; detail: string };
  checks: Check[];
  fixFirst: { title: string; detail: string }[];
};

/* ------------------------------ URL validation ------------------------------ */

export function normalizeUrl(input: unknown): { ok: true; url: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: "Enter your website address." };
  let raw = input.trim();
  if (!raw) return { ok: false, error: "Enter your website address." };
  if (raw.length > 2000) return { ok: false, error: "That address is too long." };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, error: "That doesn't look like a web address. Try something like example.com." };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: "Only http and https addresses can be checked." };
  }
  const host = u.hostname.toLowerCase();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
  if (
    isIp ||
    !host.includes(".") ||
    host === "localhost" ||
    /\.(local|internal|localhost|test|invalid|lan|home)$/.test(host)
  ) {
    return { ok: false, error: "Enter a public website address, like example.com." };
  }
  u.username = "";
  u.password = "";
  u.hash = "";
  return { ok: true, url: u.toString() };
}

/* ------------------------------- Interpretation ------------------------------ */

type Audit = {
  score: number | null;
  scoreDisplayMode?: string;
  numericValue?: number;
  /** Newer Lighthouse "insight" audits report savings per metric, in milliseconds. */
  metricSavings?: Record<string, number>;
  details?: { overallSavingsMs?: number; overallSavingsBytes?: number };
};
type LighthouseLike = {
  audits?: Record<string, Audit | undefined>;
  categories?: Record<string, { score: number | null } | undefined>;
};

const pct = (s: number | null | undefined) => (typeof s === "number" ? Math.round(s * 100) : null);

function auditStatus(a: Audit | undefined): Status | null {
  if (!a) return null;
  const mode = a.scoreDisplayMode;
  if (mode === "notApplicable" || mode === "manual" || mode === "informative" || mode === "error") return null;
  if (a.score === null || a.score === undefined) return null;
  if (a.score >= 0.9) return "pass";
  if (a.score > 0) return "warn";
  return "fail";
}

const fmtSeconds = (s: number) => `${s.toFixed(1)} second${s.toFixed(1) === "1.0" ? "" : "s"}`;

const CHECKS: { id: string; label: string; ok: string; bad: string }[] = [
  {
    id: "is-on-https",
    label: "Secure connection (HTTPS)",
    ok: "Your site loads over a secure connection.",
    bad: "Your site isn't fully secure (HTTPS). Browsers may warn visitors, and Google prefers secure sites.",
  },
  {
    id: "http-status-code",
    label: "Page loads without an error",
    ok: "The page loads normally.",
    bad: "The page returns an error. Visitors and Google may not be able to see it.",
  },
  {
    id: "is-crawlable",
    label: "Search engines can index it",
    ok: "Search engines are allowed to list this page.",
    bad: "This page is blocked from search engines, so it can't appear in Google results.",
  },
  {
    id: "document-title",
    label: "Page title",
    ok: "The page has a title for search results and browser tabs.",
    bad: "The page has no title. It's the headline people see in Google results.",
  },
  {
    id: "meta-description",
    label: "Search result description",
    ok: "The page has a description for search results.",
    bad: "No description is set, so Google chooses a random snippet. A good one helps people click.",
  },
  {
    id: "canonical",
    label: "Canonical address",
    ok: "The page tells Google which address is the main one.",
    bad: "The canonical address is missing or wrong, which can split your ranking across copies of the page.",
  },
  {
    id: "viewport-insight",
    label: "Set up for phone screens",
    ok: "The page is set up to fit phone screens.",
    bad: "The page isn't set up for phone screens, so it may show up tiny or need pinching to read.",
  },
  {
    id: "viewport",
    label: "Set up for phone screens",
    ok: "The page is set up to fit phone screens.",
    bad: "The page isn't set up for phone screens, so it may show up tiny or need pinching to read.",
  },
  {
    id: "font-size",
    label: "Readable text on phones",
    ok: "Text is a readable size on a phone.",
    bad: "Some text is too small to read comfortably on a phone.",
  },
  {
    id: "target-size",
    label: "Buttons and links easy to tap",
    ok: "Buttons and links are easy to tap with a thumb.",
    bad: "Some buttons or links are too small or too close together to tap reliably.",
  },
  {
    id: "tap-targets",
    label: "Buttons and links easy to tap",
    ok: "Buttons and links are easy to tap with a thumb.",
    bad: "Some buttons or links are too small or too close together to tap reliably.",
  },
  {
    id: "image-alt",
    label: "Image descriptions (alt text)",
    ok: "Images have descriptions for screen readers and search.",
    bad: "Some images have no description. It helps visually impaired visitors and image search.",
  },
  {
    id: "link-text",
    label: "Clear link wording",
    ok: "Links use descriptive wording.",
    bad: "Some links say things like \"click here\", which tells Google and visitors nothing.",
  },
  {
    id: "robots-txt",
    label: "robots.txt file",
    ok: "The robots.txt file is valid.",
    bad: "The robots.txt file has problems that could confuse search engines.",
  },
];

const OPPORTUNITIES: Record<string, { title: string; detail: string }> = {
  "render-blocking-resources": {
    title: "Scripts or styles hold the page back",
    detail: "Some files must finish loading before anything appears. Loading them later makes the page show faster.",
  },
  "unused-javascript": {
    title: "Code that is downloaded but never used",
    detail: "Removing or delaying unused scripts makes pages lighter, especially on slow phone connections.",
  },
  "unused-css-rules": {
    title: "Unused styling files",
    detail: "The page loads styling it doesn't use. Trimming it reduces what visitors have to download.",
  },
  "uses-optimized-images": {
    title: "Images are heavier than they need to be",
    detail: "Compressing images is often the quickest speed win.",
  },
  "modern-image-formats": {
    title: "Images aren't in a modern format",
    detail: "Formats like WebP or AVIF look the same at a much smaller size.",
  },
  "uses-responsive-images": {
    title: "Images are larger than the space they fill",
    detail: "Phones are downloading desktop-sized pictures. Serving the right size saves time.",
  },
  "offscreen-images": {
    title: "Images load before they're needed",
    detail: "Loading pictures only when visitors scroll to them makes the first view faster.",
  },
  "server-response-time": {
    title: "The server is slow to respond",
    detail: "The page takes a while to start loading. Hosting or caching changes can help.",
  },
  "render-blocking-insight": {
    title: "Scripts or styles hold the page back",
    detail: "Some files must finish loading before anything appears. Loading them later makes the page show faster.",
  },
  "image-delivery-insight": {
    title: "Images are heavier or larger than they need to be",
    detail: "Compressing images and serving them at the size they're shown is often the quickest speed win.",
  },
  "document-latency-insight": {
    title: "The server is slow, or pages aren't compressed",
    detail: "The page takes a while to start loading. Hosting, caching or turning on compression can help.",
  },
  "legacy-javascript-insight": {
    title: "Old-style code makes the page heavier",
    detail: "The site ships code for very old browsers that most visitors don't need.",
  },
  "duplicated-javascript-insight": {
    title: "The same code is downloaded more than once",
    detail: "Removing duplicates makes the page lighter and quicker.",
  },
  "third-parties-insight": {
    title: "Outside scripts slow the page",
    detail: "Chat widgets, trackers and ad tags from other companies add to the load. Remove any you don't use.",
  },
  "redirects": {
    title: "Extra redirects slow the first load",
    detail: "Visitors are bounced through several addresses before the page appears.",
  },
  "uses-text-compression": {
    title: "Text files aren't compressed",
    detail: "Turning on compression makes pages download noticeably faster.",
  },
};

export function summarize(lh: LighthouseLike, url: string): SiteCheckResult {
  const a = lh.audits ?? {};
  const lcpMs = a["largest-contentful-paint"]?.numericValue;
  const seconds = typeof lcpMs === "number" ? Math.round(lcpMs / 100) / 10 : null;

  // Speed on a phone (main content visible).
  let speed: SiteCheckResult["speed"];
  if (seconds === null) {
    speed = { seconds: null, status: "warn", headline: "Speed couldn't be measured", detail: "The test didn't return a loading time for this page." };
  } else if (seconds <= 2.5) {
    speed = {
      seconds,
      status: "pass",
      headline: `Loads in ${fmtSeconds(seconds)} on a phone`,
      detail: "That's quick. Visitors see your main content before they get impatient.",
    };
  } else if (seconds <= 4) {
    speed = {
      seconds,
      status: "warn",
      headline: `Loads in ${fmtSeconds(seconds)} on a phone`,
      detail: "It's okay but not fast. Visitors on phones tend to give up on pages that take more than about 3 seconds.",
    };
  } else {
    speed = {
      seconds,
      status: "fail",
      headline: `Loads in ${fmtSeconds(seconds)} on a phone`,
      detail: "That's slow. Many visitors will leave before the page appears, and Google may rank it lower.",
    };
  }

  // Responsiveness (total blocking time).
  const tbt = a["total-blocking-time"]?.numericValue;
  const responsiveness: SiteCheckResult["responsiveness"] =
    typeof tbt !== "number"
      ? { status: "warn", detail: "Couldn't measure how quickly the page reacts to taps." }
      : tbt <= 200
        ? { status: "pass", detail: "The page reacts quickly to taps and scrolling." }
        : tbt <= 600
          ? { status: "warn", detail: "The page freezes briefly while loading. Taps and scrolling can feel laggy." }
          : { status: "fail", detail: `The page is stuck for about ${fmtSeconds(tbt / 1000)} while loading, so taps and scrolling feel sluggish.` };

  // Layout stability.
  const cls = a["cumulative-layout-shift"]?.numericValue;
  const stability: SiteCheckResult["stability"] =
    typeof cls !== "number"
      ? { status: "warn", detail: "Couldn't measure whether content jumps around." }
      : cls <= 0.1
        ? { status: "pass", detail: "Content stays put while the page loads." }
        : cls <= 0.25
          ? { status: "warn", detail: "Some content jumps around while loading, which can cause mis-taps." }
          : { status: "fail", detail: "Content jumps around a lot while loading, which is frustrating and causes mis-taps." };

  // Checklist, dropping anything that isn't applicable.
  const checks: Check[] = [];
  const seenLabels = new Set<string>();
  for (const c of CHECKS) {
    if (seenLabels.has(c.label)) continue; // old and new Lighthouse ids for the same check
    const status = auditStatus(a[c.id]);
    if (!status) continue;
    seenLabels.add(c.label);
    checks.push({ id: c.id, label: c.label, status, detail: status === "pass" ? c.ok : c.bad });
  }

  // Phone usability from the mobile-related checks.
  const mobileIds = ["viewport-insight", "viewport", "font-size", "target-size", "tap-targets"];
  const mobileChecks = checks.filter((c) => mobileIds.includes(c.id));
  const mobileFail = mobileChecks.find((c) => c.status === "fail");
  const mobileWarn = mobileChecks.find((c) => c.status === "warn");
  const mobile: SiteCheckResult["mobile"] = mobileChecks.length === 0
    ? { status: "warn", detail: "Couldn't check phone usability for this page." }
    : mobileFail
      ? { status: "fail", detail: mobileFail.detail }
      : mobileWarn
        ? { status: "warn", detail: mobileWarn.detail }
        : { status: "pass", detail: "The phone basics we tested are in place." };

  // Biggest time savings, in plain language.
  const savingsMs = (au: Audit | undefined) => {
    if (!au) return 0;
    if (typeof au.details?.overallSavingsMs === "number") return au.details.overallSavingsMs;
    if (au.metricSavings && au.score !== null && au.score < 0.9) {
      return Math.max(0, ...Object.values(au.metricSavings).filter((n) => typeof n === "number"));
    }
    return 0;
  };
  const seenTitles = new Set<string>();
  const fixFirst = Object.entries(OPPORTUNITIES)
    .map(([id, text]) => ({ id, text, ms: savingsMs(a[id]) }))
    .filter((o) => o.ms >= 100)
    .sort((x, y) => y.ms - x.ms)
    .filter((o) => !seenTitles.has(o.text.title) && seenTitles.add(o.text.title))
    .slice(0, 3)
    .map((o) => o.text);

  const bytes = a["total-byte-weight"]?.numericValue;
  const pageWeightMb = typeof bytes === "number" ? Math.round((bytes / 1048576) * 10) / 10 : null;
  if (pageWeightMb !== null && pageWeightMb >= 3 && fixFirst.length < 3) {
    fixFirst.push({
      title: `The page is heavy (${pageWeightMb} MB)`,
      detail: "Big pages are slow on mobile data. Smaller images and fewer scripts are the usual fixes.",
    });
  }

  return {
    url,
    checkedAt: new Date().toISOString(),
    scores: { performance: pct(lh.categories?.performance?.score), seo: pct(lh.categories?.seo?.score) },
    speed,
    stability,
    responsiveness,
    pageWeightMb,
    mobile,
    checks,
    fixFirst,
  };
}
