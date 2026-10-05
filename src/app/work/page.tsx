import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { ProjectCard } from "@/components/ProjectCard";
import { CtaBlock } from "@/components/CtaBlock";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Selected Work — SEO, Ads & Website Projects",
  description:
    "Projects across SEO, Google Ads, Meta Ads, analytics, websites and automation: what I worked on and the sites I built.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Selected Work", path: "/work" }]}
        eyebrow="Selected Work"
        title="What I've worked on, and how."
        intro="Real projects, described plainly: the sites I built and the channels I worked on."
      />
      <Section tone="alt" className="!pt-14">
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 70}>
              <ProjectCard project={p} index={i} as="h2" />
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBlock />
    </>
  );
}
