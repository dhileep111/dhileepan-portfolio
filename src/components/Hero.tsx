import { site } from "@/content/site";
import { Button, Container, Arrow } from "./ui";

const layers = [
  { k: "Search", v: "Be found by people already looking" },
  { k: "Paid", v: "Reach the right audience, on purpose" },
  { k: "Site", v: "Turn visits into enquiries" },
  { k: "Tracking", v: "Know what actually works" },
  { k: "Automation", v: "Remove repetitive work" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
      <Container className="grid items-end gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Independent · Remote · Tamil Nadu, India</p>
          <h1 className="display mt-6">
            Digital growth systems built for real businesses.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            SEO, paid advertising, analytics and AI-powered systems — built and managed with a
            technical, performance-focused approach.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact">
              Start a Project <Arrow />
            </Button>
            <Button href="/work" variant="secondary">
              View My Work
            </Button>
          </div>
          <ul
            aria-label="Core capabilities"
            className="mt-12 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-muted sm:text-[0.8rem]"
          >
            {site.credibility.map((c, i) => (
              <li key={c} className="flex items-center gap-3">
                {c}
                {i < site.credibility.length - 1 && <span aria-hidden="true">•</span>}
              </li>
            ))}
          </ul>
        </div>

        <aside
          aria-label="How the pieces of a growth system fit together"
          className="rounded-2xl border border-line bg-paper-2/60 p-6 sm:p-8"
        >
          <p className="eyebrow">One system, not five vendors</p>
          <ol className="mt-6">
            {layers.map((l, i) => (
              <li key={l.k} className="relative flex gap-5 pb-6 last:pb-0">
                {i < layers.length - 1 && (
                  <span aria-hidden="true" className="absolute left-[0.6rem] top-6 h-[calc(100%-1.1rem)] w-px bg-line" />
                )}
                <span
                  aria-hidden="true"
                  className="relative mt-1 size-[1.3rem] shrink-0 rounded-full border border-ink bg-paper after:absolute after:inset-[5px] after:rounded-full after:bg-ink"
                />
                <div>
                  <p className="text-base font-medium">{l.k}</p>
                  <p className="text-sm text-muted">{l.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </Container>
    </section>
  );
}
