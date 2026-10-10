import { Arrow, Button, Section } from "./ui";

const checks = [
  "SEO basics: indexing, titles, structure, speed",
  "Mobile experience and page speed",
  "Tracking: GA4, Tag Manager, Search Console",
  "How your ads connect to your landing pages",
];

export function AuditOffer() {
  return (
    <Section tone="signal">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Free site &amp; tracking review</p>
          <h2 className="h2 mt-5">Not sure where to start? Let me look first.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
            Send me your website. I&rsquo;ll review it and send back a short written summary of what I
            found and what I&rsquo;d fix first. No obligation.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact#audit" variant="dark">
              Request a free review <Arrow />
            </Button>
            <Button href="/tools/site-check" variant="secondary">
              Or run an instant check
            </Button>
          </div>
        </div>
        <div>
          <p className="eyebrow">What I look at</p>
          <ul className="mt-5 divide-y-2 divide-ink border-y-2 border-ink">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-4 py-4">
                <span aria-hidden="true" className="h-0.5 w-4 shrink-0 bg-ink" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
