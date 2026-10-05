import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { Tools } from "@/components/Tools";
import { CtaBlock } from "@/components/CtaBlock";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About — Engineering mindset, marketing execution",
  description:
    "An engineer by education and former sound technician, now working in SEO, paid advertising, analytics, websites and AI automation. Based in Tamil Nadu, India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="About"
        title="Engineering mindset. Marketing execution."
      />

      <Section tone="alt" className="!pt-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <div>
            <p className="eyebrow">Background</p>
            <dl className="mt-6 divide-y divide-line border-y border-line text-[0.95rem]">
              {[
                ["Education", "Engineering"],
                ["Earlier work", "Sound technician / sound engineer"],
                ["Now", "Digital marketing & technology"],
                ["Learning", "AI engineering"],
                ["Based in", `${site.location.region}, ${site.location.country}`],
                ["Works with", "Businesses, remotely"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              I&rsquo;m an engineer by education. Before marketing I worked as a sound technician, setting
              up and running sound systems. That work taught me to trace a problem through the chain,
              one link at a time, until I find the one that&rsquo;s actually causing it.
            </p>
            <p className="text-muted">
              I moved into digital marketing and brought that habit with me. When something isn&rsquo;t
              working, I check the whole path: the ad, the landing page, the tracking and the follow-up.
            </p>
            <p className="text-muted">
              Today I work across SEO, paid advertising, analytics, websites, automation and AI.
              I work independently and directly with each business. I&rsquo;m also learning AI engineering
              and building automation workflows for research and reporting.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <p className="eyebrow">Both sides of the work</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line p-8">
            <h2 className="text-2xl font-medium tracking-tight">Technical implementation</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Tag setup, tracking, site structure, WordPress, scripts and automation: the setup work
              that campaigns and reporting depend on.
            </p>
          </div>
          <div className="rounded-2xl border border-line p-8">
            <h2 className="text-2xl font-medium tracking-tight">Business marketing</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Audience, offer, campaigns and conversion. Deciding what to measure and what to improve
              based on what matters to the business.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <p className="eyebrow">Tools & Platforms</p>
        <h2 className="h2 mt-5 max-w-2xl">What I work with.</h2>
        <div className="mt-12">
          <Tools />
        </div>
      </Section>
      <CtaBlock />
    </>
  );
}
