"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import type { SiteCheckResult, Status } from "@/lib/siteCheck";
import { Arrow } from "./ui";

type State =
  | { phase: "idle" }
  | { phase: "loading"; url: string }
  | { phase: "error"; message: string }
  | { phase: "done"; result: SiteCheckResult };

const statusMeta: Record<Status, { label: string; mark: string; cls: string }> = {
  pass: { label: "Good", mark: "✓", cls: "bg-forest text-paper border-ink" },
  warn: { label: "Needs work", mark: "!", cls: "bg-signal text-ink border-ink" },
  fail: { label: "Fix this", mark: "✕", cls: "bg-danger text-paper border-ink" },
};

function Badge({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border-2 px-2 py-0.5 font-display text-xs font-bold ${m.cls}`}>
      <span aria-hidden="true">{m.mark}</span>
      {m.label}
    </span>
  );
}

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SiteCheck() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [value, setValue] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.phase === "loading") return;
    const url = value.trim();
    if (!url) {
      setState({ phase: "error", message: "Enter your website address first." });
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 65_000);
    setState({ phase: "loading", url });
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: ctrl.signal,
      });
      const data = (await res.json()) as { result?: SiteCheckResult; error?: string };
      if (!res.ok || !data.result) {
        setState({ phase: "error", message: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      try {
        sessionStorage.setItem("siteCheckUrl", data.result.url);
      } catch {
        /* storage unavailable: the contact form just won't be prefilled */
      }
      setState({ phase: "done", result: data.result });
    } catch {
      setState({ phase: "error", message: "The check took too long or the connection dropped. Please try again." });
    } finally {
      clearTimeout(timer);
    }
  }

  const loading = state.phase === "loading";

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row" noValidate>
        <label className="sr-only" htmlFor="site-url">
          Website address
        </label>
        <input
          id="site-url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourwebsite.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          className="min-h-14 w-full flex-1 border-2 border-ink bg-paper px-4 text-lg text-ink placeholder:text-muted/70 focus:shadow-[4px_4px_0_0_var(--color-signal)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 items-center justify-center gap-3 border-2 border-ink bg-signal px-7 font-display text-base font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-ink)] disabled:opacity-60"
        >
          {loading ? "Checking…" : "Check my site"}
          {!loading && <Arrow />}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {state.phase === "loading" && (
          <p className="border-2 border-ink bg-paper p-5 text-base">
            Testing <strong>{host(state.url)}</strong> on a simulated phone. This usually takes 20–40 seconds.
          </p>
        )}
        {state.phase === "error" && (
          <p role="alert" className="border-2 border-ink bg-paper p-5 text-base font-semibold text-danger">
            {state.message}
          </p>
        )}
      </div>

      {state.phase === "done" && <Results result={state.result} />}
    </div>
  );
}

function Results({ result }: { result: SiteCheckResult }) {
  const passed = result.checks.filter((c) => c.status === "pass").length;
  const attention = result.checks.filter((c) => c.status !== "pass");
  const headlineCards = [
    {
      title: "Speed on a phone",
      status: result.speed.status,
      big: result.speed.seconds !== null ? `${result.speed.seconds.toFixed(1)}s` : "–",
      text: result.speed.detail,
    },
    {
      title: "Phone-friendliness",
      status: result.mobile.status,
      big: { pass: "Good", warn: "Needs work", fail: "Problems found" }[result.mobile.status],
      text: result.mobile.detail,
    },
    {
      title: "Search basics",
      status: (attention.some((c) => c.status === "fail") ? "fail" : attention.length ? "warn" : "pass") as Status,
      big: result.checks.length ? `${passed} of ${result.checks.length}` : "–",
      text:
        attention.length === 0
          ? "The basics Google looks for are all in place."
          : `${attention.length} thing${attention.length === 1 ? "" : "s"} to look at, listed below.`,
    },
  ];

  return (
    <section aria-labelledby="results-heading" className="mt-12">
      <p className="eyebrow">Results</p>
      <h2 id="results-heading" className="h2 mt-4 break-words">
        {host(result.url)}
      </h2>
      <p className="mt-3 text-muted">{result.speed.headline}.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {headlineCards.map((c) => (
          <div key={c.title} className="flex flex-col border-2 border-ink bg-paper p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-sm font-bold">{c.title}</p>
              <Badge status={c.status} />
            </div>
            <p className="mt-5 font-display text-4xl font-extrabold tracking-tight">{c.big}</p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="border-2 border-ink bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-sm font-bold">Reacts to taps</p>
            <Badge status={result.responsiveness.status} />
          </div>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{result.responsiveness.detail}</p>
        </div>
        <div className="border-2 border-ink bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-sm font-bold">Stays steady while loading</p>
            <Badge status={result.stability.status} />
          </div>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{result.stability.detail}</p>
        </div>
      </div>

      {result.fixFirst.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display text-2xl font-bold tracking-tight">What I&rsquo;d look at first</h3>
          <ol className="mt-5 divide-y-2 divide-ink border-y-2 border-ink">
            {result.fixFirst.map((f, i) => (
              <li key={f.title} className="flex gap-5 py-5">
                <span className="font-display text-sm font-bold text-accent">0{i + 1}</span>
                <div>
                  <p className="font-display text-lg font-bold">{f.title}</p>
                  <p className="mt-1 text-muted">{f.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.checks.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display text-2xl font-bold tracking-tight">The basics, one by one</h3>
          <ul className="mt-5 divide-y-2 divide-ink border-y-2 border-ink">
            {result.checks.map((c) => (
              <li key={c.id} className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr_auto] sm:items-start sm:gap-6">
                <p className="font-display text-base font-bold">{c.label}</p>
                <p className="text-muted">{c.detail}</p>
                <div className="sm:justify-self-end">
                  <Badge status={c.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-10 text-sm leading-relaxed text-muted">
        This is a quick automated test run by Google&rsquo;s PageSpeed Insights on a simulated mid-range phone, from one
        location. Real visitors&rsquo; experience varies with their phone and connection. It does not look at your
        analytics, ads or content.
      </p>

      <div className="mt-12 border-2 border-ink bg-signal p-7 shadow-[7px_7px_0_0_var(--color-ink)] sm:p-9">
        <p className="eyebrow !text-ink">Want me to look deeper?</p>
        <h3 className="h2 mt-4 max-w-2xl">Request a full review of your site.</h3>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/80">
          I&rsquo;ll go beyond this quick test: SEO, tracking and how your ads connect to your pages. You get a short
          written summary of what I found and what I&rsquo;d fix first. No obligation.
        </p>
        <Link
          prefetch={false}
          href="/contact#audit"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 border-2 border-ink bg-ink px-6 font-display text-[0.95rem] font-bold text-paper shadow-[4px_4px_0_0_var(--color-paper)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-paper)]"
        >
          Request a full review <Arrow />
        </Link>
      </div>
    </section>
  );
}
