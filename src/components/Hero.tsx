import Link from "next/link";
import { site } from "@/content/site";
import { assetUrl, publicFileExists } from "@/lib/assets";
import { Button, Container, Arrow } from "./ui";

// Each channel is a link in the chain. Fader positions are decorative only.
const channels = [
  { k: "Search", v: "Be found by people already looking", level: 72 },
  { k: "Paid", v: "Reach the right audience, on purpose", level: 58 },
  { k: "Site", v: "Turn visits into enquiries", level: 80 },
  { k: "Tracking", v: "Know what actually works", level: 64 },
  { k: "Automation", v: "Remove repetitive work", level: 76 },
];

// Tight crop of mixing-console faders, converted to a teal/yellow duotone.
// SOURCE: "Close up photo of audio mixer" by Adi Goldstein (@adigold1), Unsplash License
// https://unsplash.com/photos/close-up-photo-of-audio-mixer-sdtnZ4LgbWk
// Swap for a real personal photo any time by replacing public/hero-faders.webp (1200x320).
const HERO_IMAGE = "/hero-faders.webp";

export function Hero() {
  const hasImage = publicFileExists(HERO_IMAGE);
  return (
    <section className="grid-bg relative overflow-hidden bg-teal pb-20 pt-14 text-paper sm:pb-28 sm:pt-20">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow !text-paper/75">Independent · Remote · Tamil Nadu, India</p>
          <h1 className="display mt-6">
            Digital growth systems built for{" "}
            <span className="box-decoration-clone bg-signal px-[0.12em] text-ink">real businesses.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/80 sm:text-xl">
            SEO, paid advertising, analytics and AI-powered systems — built and managed with a
            technical, performance-focused approach.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact" variant="light">
              Start a Project <Arrow />
            </Button>
            <Button href="/work" variant="ghost">
              View My Work
            </Button>
          </div>
          <ul
            aria-label="Core capabilities"
            className="mt-12 flex flex-wrap gap-x-4 gap-y-2 font-display text-xs font-semibold text-paper/70 sm:text-[0.8rem]"
          >
            {site.credibility.map((c, i) => (
              <li key={c} className="flex items-center gap-4">
                {c}
                {i < site.credibility.length - 1 && (
                  <span aria-hidden="true" className="size-1.5 bg-signal" />
                )}
              </li>
            ))}
          </ul>
        </div>

        <aside
          aria-label="How the pieces of a growth system fit together"
          className="border-2 border-paper bg-teal-2 shadow-[7px_7px_0_0_var(--color-signal)]"
        >
          {hasImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetUrl(HERO_IMAGE)}
              alt="Close-up of the faders on a mixing console"
              width={1200}
              height={320}
              decoding="async"
              className="block h-24 w-full border-b-2 border-paper object-cover sm:h-28"
            />
          )}
          <div className="p-6 sm:p-7">
            <p className="eyebrow !text-paper/75">One system, not five vendors</p>
            <ol className="mt-6">
              {channels.map((c, i) => (
                <li key={c.k} className="relative flex gap-4 pb-6">
                  {i < channels.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[0.5rem] top-5 h-[calc(100%-0.6rem)] w-0.5 bg-paper/40" />
                  )}
                  <span aria-hidden="true" className="relative mt-1 size-[1.15rem] shrink-0 border-2 border-paper bg-teal-2 after:absolute after:inset-[3px] after:bg-signal" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold tracking-tight">{c.k}</p>
                    <p className="text-sm text-paper/70">{c.v}</p>
                    <div aria-hidden="true" className="relative mt-3 h-1.5 bg-paper/20">
                      <span
                        className="absolute top-1/2 h-5 w-3 -translate-y-1/2 border-2 border-teal-2 bg-signal"
                        style={{ left: `calc(${c.level}% - 0.375rem)` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="border-t border-paper/25 pt-5 text-[0.95rem] leading-relaxed text-paper/85">
              Before marketing I worked as a sound technician. I still trace every problem through the
              chain, one link at a time.{" "}
              <Link
                prefetch={false}
                href="/about"
                className="font-semibold text-signal underline underline-offset-4 hover:text-paper"
              >
                More about me
              </Link>
            </p>
          </div>
        </aside>
      </Container>
    </section>
  );
}
