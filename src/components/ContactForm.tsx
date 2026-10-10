"use client";

import { useEffect, useState, type FormEvent } from "react";
import { site } from "@/content/site";

const helpOptions = [
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Analytics & Tracking",
  "Website / Landing Page",
  "AI & Automation",
  "Free site & tracking review",
  "Not sure yet",
];

const budgetOptions = [
  "Prefer to discuss",
  "Under ₹25,000 / month",
  "₹25,000 – ₹75,000 / month",
  "₹75,000+ / month",
  "One-time project",
];

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; via: "endpoint" | "mailto" }
  | { state: "error"; message: string };

const field =
  "mt-2 block w-full border-2 border-ink bg-paper px-4 py-3.5 text-base text-ink placeholder:text-muted/70 focus:shadow-[4px_4px_0_0_var(--color-signal)]";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  // Submit stays disabled until hydrated so a native GET submit can never put
  // personal details into the URL.
  const [ready, setReady] = useState(false);
  const [need, setNeed] = useState("");
  const [website, setWebsite] = useState("");
  useEffect(() => {
    setReady(true);
    if (window.location.hash === "#audit") setNeed("Free site & tracking review");
    try {
      // Prefill the address the visitor just ran through the site checker.
      const checked = sessionStorage.getItem("siteCheckUrl");
      if (checked) setWebsite(checked);
    } catch {
      /* storage unavailable */
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.company_website_hp) return; // honeypot

    if (site.formEndpoint) {
      setStatus({ state: "sending" });
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        form.reset();
        setStatus({ state: "sent", via: "endpoint" });
      } catch {
        setStatus({
          state: "error",
          message: site.contact.email
            ? `Something went wrong. Please email ${site.contact.email} directly.`
            : "Something went wrong. Please try again in a moment.",
        });
      }
      return;
    }

    if (site.contact.email) {
      const body = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Business: ${data.business || "-"}`,
        `Website: ${data.website || "-"}`,
        `Help needed: ${data.need}`,
        `Budget: ${data.budget || "-"}`,
        "",
        data.message,
      ].join("\n");
      window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(
        `Project enquiry from ${data.name}`,
      )}&body=${encodeURIComponent(body)}`;
      setStatus({ state: "sent", via: "mailto" });
      return;
    }

    setStatus({
      state: "error",
      message: "The contact form isn’t connected yet. Please check back soon.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6">
      {process.env.NODE_ENV !== "production" && !site.formEndpoint && (
        <p className="rounded-lg border-2 border-ink bg-signal/40 px-4 py-3 text-sm">
          <strong>Dev notice (hidden in production):</strong> set NEXT_PUBLIC_FORM_ENDPOINT to connect
          this form.{" "}
          {site.contact.email
            ? "Until then it opens the visitor’s email app."
            : "contact.email is also empty in src/content/site.ts, so submitting shows “not connected”."}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block font-display text-sm font-bold">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block font-display text-sm font-bold">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block font-display text-sm font-bold">
          Business / Company
          <input name="business" autoComplete="organization" className={field} />
        </label>
        <label className="block font-display text-sm font-bold">
          Website
          <input
            name="website"
            type="url"
            inputMode="url"
            placeholder="https://"
            autoComplete="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={field}
          />
        </label>
        <label className="block font-display text-sm font-bold">
          What do you need help with?
          <select name="need" required value={need} onChange={(e) => setNeed(e.target.value)} className={field}>
            <option value="" disabled>
              Select one
            </option>
            {helpOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="block font-display text-sm font-bold">
          Budget <span className="font-normal text-muted">(optional)</span>
          <select name="budget" defaultValue="" className={field}>
            <option value="">Select a range</option>
            {budgetOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block font-display text-sm font-bold">
        Message
        <textarea
          name="message"
          required
          rows={6}
          placeholder="What are you trying to build, improve or grow?"
          className={field}
        />
      </label>

      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input name="company_website_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!ready || status.state === "sending"}
          className="inline-flex min-h-12 items-center justify-center border-2 border-ink bg-signal px-7 font-display text-[0.95rem] font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-ink)] disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending…" : "Start a Conversation"}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {status.state === "sent" && status.via === "endpoint" && (
            <span className="text-ink">Thanks — your message is in. I&rsquo;ll reply personally.</span>
          )}
          {status.state === "sent" && status.via === "mailto" && (
            <span className="text-ink">Your email app should open with the message ready to send.</span>
          )}
          {status.state === "error" && <span className="font-semibold text-danger">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
