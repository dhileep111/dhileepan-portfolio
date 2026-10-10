import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Section, Arrow } from "@/components/ui";
import { AuditOffer } from "@/components/AuditOffer";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, site } from "@/content/site";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const base = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.name],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@id": absoluteUrl("/#person") },
    publisher: { "@id": absoluteUrl("/#person") },
    inLanguage: "en-IN",
  };

  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        crumbs={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
        eyebrow={`${formatDate(post.date)} · ${post.readingMinutes} min read`}
        title={post.title}
        intro={post.excerpt}
      />
      <Section className="!pt-0">
        <article
          className="prose-post max-w-3xl"
          // Markdown comes from files in this repo that you write, not from visitors.
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        {post.updated && (
          <p className="mt-10 text-sm text-muted">
            Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
          </p>
        )}
        <p className="mt-10 max-w-3xl border-t-2 border-ink pt-6">
          <Link
            prefetch={false}
            href="/blog"
            className="inline-flex items-center gap-2 font-display text-sm font-bold underline-offset-4 hover:underline"
          >
            <span className="rotate-180">
              <Arrow />
            </span>
            All posts
          </Link>
        </p>
      </Section>
      <AuditOffer />
    </>
  );
}
