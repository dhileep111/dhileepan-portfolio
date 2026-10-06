import { Arrow, Button, Section } from "./ui";

const checks = [
  "SEO basics: indexing, titles, structure, speed",
  "Mobile experience and page speed",
  "Tracking: GA4, Tag Manager, Search Console",
  "How your ads connect to your landing pages",
];

export function AuditOffer() {
  return (
    <Section tone="alt">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Free site &amp; tracking review</p>
          <h2 className="h2 mt-5">Not sure where to start? Let me look first.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Send me your website. I&rsquo;ll review it and send back a short written summary of what I
            found and what I&rsquo;d fix first. No obligation.
          </p>
          <div className="mt-8">
            <Button href="/contact#audit">
              Request a free review <Arrow />
            </Button>
          </div>
        </div>
        <div>
          <p className="eyebrow">What I look at</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-4 py-4">
                <span aria-hidden="true" className="h-px w-4 shrink-0 bg-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
