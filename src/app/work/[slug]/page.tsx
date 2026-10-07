import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Section, Tag, Arrow } from "@/components/ui";
import { Metrics } from "@/components/Metrics";
import { BrowserFrame } from "@/components/BrowserFrame";
import { publicFileExists } from "@/lib/assets";
import { CtaBlock } from "@/components/CtaBlock";
import { getProject, isPublishedCaseStudy, projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMetadata({
    title: `${p.name} — ${p.services.slice(0, 3).join(", ")}`,
    description: p.description,
    path: `/work/${p.slug}`,
    // Thin pages stay out of the index until real case-study content is added.
    noindex: !isPublishedCaseStudy(p),
  });
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr] md:gap-12">
      <h2 className="eyebrow">{label}</h2>
      <div className="max-w-2xl text-lg leading-relaxed">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it} className="flex gap-4">
          <span aria-hidden="true" className="mt-3 h-0.5 w-4 shrink-0 bg-ink" />
          {it}
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const c = p.caseStudy ?? {};
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Selected Work", path: "/work" },
          { name: p.name, path: `/work/${p.slug}` },
        ]}
        eyebrow={`Project · ${p.industry}`}
        title={p.name}
        intro={c.overview ?? p.description}
      />

      <Section className="!pt-0">
        <div className="mb-10 flex flex-wrap gap-2">
          <ul aria-label="Services" className="flex flex-wrap gap-2">
            {p.services.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </ul>
        </div>

        {p.metrics && (
          <div className="mb-6">
            <Metrics metrics={p.metrics} />
          </div>
        )}

        <Block label="What I worked on">
          <BulletList items={p.services} />
        </Block>

        {p.sites && p.sites.length > 0 && (
          <Block label={p.sites.length > 1 ? "The websites" : "The website"}>
            <div className="space-y-10">
              {p.sites.map((s) => (
                <div key={s.url}>
                  {publicFileExists(s.image) && <BrowserFrame site={s} />}
                  <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-base">
                    <span className="font-medium">{s.label}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted underline-offset-4 hover:text-ink hover:underline"
                    >
                      Visit {new URL(s.url).host.replace(/^www\./, "")} ↗
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </Block>
        )}

        {c.challenge && <Block label="The challenge"><p>{c.challenge}</p></Block>}
        {c.strategy && <Block label="Strategy"><BulletList items={c.strategy} /></Block>}
        {c.implementation && <Block label="Implementation"><BulletList items={c.implementation} /></Block>}
        {c.tools && (
          <Block label="Tools used">
            <ul className="flex flex-wrap gap-2">
              {c.tools.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </ul>
          </Block>
        )}
        {c.outcome && <Block label="Outcome"><p>{c.outcome}</p></Block>}

        {p.evidence && p.evidence.length > 0 && (
          <Block label="Screenshots / evidence">
            <div className="space-y-8">
              {p.evidence.map((e) => (
                <figure key={e.src}>
                  <Image
                    src={e.src}
                    alt={e.alt}
                    width={e.width}
                    height={e.height}
                    sizes="(min-width: 1024px) 42rem, 100vw"
                    className="w-full border-2 border-ink"
                  />
                  <figcaption className="mt-3 text-sm text-muted">{e.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {c.learnings && <Block label="Key learnings"><BulletList items={c.learnings} /></Block>}

        <div className="mt-6 border-t border-line pt-10">
          <p className="eyebrow">Next project</p>
          <Link
          prefetch={false}
            href={`/work/${next.slug}`}
            className="mt-3 inline-flex items-center gap-3 font-display text-2xl font-bold tracking-tight underline-offset-4 hover:text-accent hover:underline"
          >
            {next.name} <Arrow />
          </Link>
        </div>
      </Section>
      <CtaBlock />
    </>
  );
}
