import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Section, SectionHeading, Arrow } from "@/components/ui";
import { ServiceCard } from "@/components/ServiceCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Tools } from "@/components/Tools";
import { CtaBlock } from "@/components/CtaBlock";
import { Illustration } from "@/components/Illustration";
import { AuditOffer } from "@/components/AuditOffer";
import { FaqSection } from "@/components/FaqSection";
import { Reveal } from "@/components/Reveal";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${site.name} — ${site.positioning} | SEO, Ads, Analytics`,
    description: site.description,
    path: "/",
  }),
  title: { absolute: `${site.name} — ${site.positioning} | SEO, Ads, Analytics` },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Analytics &amp; tracking</p>
            <h2 className="h2 mt-5">See which ads, pages and keywords bring real enquiries.</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              I set up GA4, Google Tag Manager and Search Console so decisions are based on data, not guesses.
            </p>
            <p className="mt-8">
              <Link
                prefetch={false}
                href="/services#analytics-tracking"
                className="inline-flex items-center gap-2 font-display text-sm font-bold underline underline-offset-4 hover:text-accent"
              >
                How tracking works <Arrow />
              </Link>
            </p>
          </div>
          <Illustration name="analytics-setup" className="mx-auto w-full max-w-lg lg:max-w-none" />
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading
          eyebrow="Services"
          title="SEO, ads, tracking and websites, handled by one person."
          intro="Search, ads, tracking, websites and automation work best when one person understands how they connect."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 70}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <p className="mt-10">
          <Link prefetch={false} href="/services" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
            Explore all services <Arrow />
          </Link>
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects I've worked on."
          intro="The sites I built and the channels I worked on, described plainly."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 70}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
        <p className="mt-10">
          <Link prefetch={false} href="/work" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
            See all selected work <Arrow />
          </Link>
        </p>
      </Section>

      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow="About" title="Engineering mindset. Marketing execution." />
          <div className="space-y-6 text-lg leading-relaxed text-muted">
            <p>
              I come from an engineering and live-sound background, and moved into digital marketing
              and technology. That training shows in how I work: check the setup, find the cause,
              then fix it properly.
            </p>
            <p>
              I work across SEO, paid advertising, analytics, websites, automation and AI, so
              strategy and implementation stay in the same hands.
            </p>
            <Link prefetch={false} href="/about" className="inline-flex items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline">
              More about me <Arrow />
            </Link>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Process"
          title="A simple, practical way of working."
        />
        <div className="mt-14">
          <ProcessSteps />
        </div>
      </Section>

      <AuditOffer />

      <Section>
        <SectionHeading
          eyebrow="Tools & Platforms"
          title="The tools I work in day to day."
        />
        <div className="mt-14">
          <Tools />
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading eyebrow="FAQ" title="Questions people ask before we start." />
        <div className="mt-14 max-w-3xl">
          <FaqSection schema />
        </div>
      </Section>

      <CtaBlock />
    </>
  );
}
