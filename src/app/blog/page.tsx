import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section, Arrow } from "@/components/ui";
import { CtaBlock } from "@/components/CtaBlock";
import { formatDate, getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const posts = getAllPosts();

// With no posts yet the page stays out of search results (and out of the sitemap).
export const metadata: Metadata = pageMetadata({
  title: "Blog — SEO, Ads & Tracking Notes",
  description: "Practical notes on SEO, paid advertising, analytics and automation.",
  path: "/blog",
  noindex: posts.length === 0,
});

export default function BlogIndexPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Blog"
        title="Notes from the work."
        intro="Practical notes on SEO, paid advertising, analytics and automation."
      />
      <Section tone="alt" className="!pt-14">
        {posts.length === 0 ? (
          <p className="max-w-xl text-lg text-muted">The first posts are on their way.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug} className="h-full">
                <article className="group relative flex h-full flex-col border-2 border-ink bg-paper p-7 transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
                  <p className="font-display text-xs font-semibold text-muted">
                    <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min read
                  </p>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{p.excerpt}</p>
                  <div className="mt-auto pt-8">
                    <Link
                      prefetch={false}
                      href={`/blog/${p.slug}`}
                      className="inline-flex items-center gap-2 font-display text-sm font-bold after:absolute after:inset-0 after:content-['']"
                    >
                      Read post <Arrow />
                      <span className="sr-only"> — {p.title}</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <CtaBlock />
    </>
  );
}
