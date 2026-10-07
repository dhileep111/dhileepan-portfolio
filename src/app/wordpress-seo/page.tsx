import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section, SectionHeading, Button, Arrow } from "@/components/ui";
import { FaqSection } from "@/components/FaqSection";
import { CtaBlock } from "@/components/CtaBlock";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import type { Faq } from "@/content/faq";

export const metadata = pageMetadata({
  title: "WordPress SEO & Tracking",
  description:
    "Technical SEO, page speed and analytics tracking for WordPress sites: indexing, titles and schema, Core Web Vitals, GA4, Tag Manager and Search Console, done hands-on.",
  path: "/wordpress-seo",
});

const groups = [
  {
    title: "Technical SEO",
    items: [
      "Indexing, robots and sitemap checks",
      "Canonical URLs and duplicate pages",
      "Site structure and internal links",
      "Redirects and broken pages",
    ],
  },
  {
    title: "On-page & schema",
    items: [
      "Titles, meta descriptions and headings",
      "Structured data (schema)",
      "Content gaps against what people search",
      "SEO plugin setup, such as Yoast SEO",
    ],
  },
  {
    title: "Speed & mobile",
    items: [
      "Core Web Vitals review",
      "Plugin, caching and image checks",
      "Mobile layout problems",
      "Page builder weight, such as Elementor",
    ],
  },
  {
    title: "Tracking",
    items: [
      "GA4 and Google Tag Manager setup",
      "Form, WhatsApp and call-click events",
      "Search Console and Site Kit connection",
      "Microsoft Clarity for behaviour insight",
    ],
  },
];

const faq: Faq[] = [
  {
    q: "Do you only work on WordPress?",
    a: "WordPress is where most of my site work happens, so that's what this page covers. The SEO, ads and tracking work applies to other platforms too. Ask and I'll tell you honestly if a site is outside what I do well.",
  },
  {
    q: "Will you change my site without asking?",
    a: "No. I start with a review and tell you what I'd change and why. Changes that affect how the site looks or works are agreed with you first.",
  },
  {
    q: "Can you fix tracking on a site that already has Google Analytics?",
    a: "Yes. A common problem is tracking that is installed but not recording the actions that matter, such as form submissions or WhatsApp clicks. I check what is actually being recorded and fix what's missing.",
  },
];

export default function WordPressSeoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "WordPress SEO & Tracking",
    serviceType: "WordPress SEO, page speed and analytics tracking",
    provider: { "@id": absoluteUrl("/#person") },
    areaServed: "Worldwide",
  };
  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        crumbs={[
          { name: "Services", path: "/services" },
          { name: "WordPress SEO & Tracking", path: "/wordpress-seo" },
        ]}
        eyebrow="WordPress SEO & Tracking"
        art="search-engines"
        title="A WordPress site that search engines can read and you can measure."
        intro="Many WordPress sites look fine but have indexing problems, slow pages or tracking that doesn't record real enquiries. I review the site, fix what matters and make sure you can see the results."
      />

      <Section tone="alt" className="!pt-14">
        <SectionHeading eyebrow="What I check and fix" title="Four areas, handled together." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="border-2 border-ink bg-paper p-7 sm:p-8">
              <h3 className="text-2xl font-bold tracking-tight">{g.title}</h3>
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-[0.95rem]">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-0.5 w-3 bg-ink" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/contact#audit">
            Request a free review <Arrow />
          </Button>
          <Button href="/process" variant="secondary">
            How I work
          </Button>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="FAQ" title="WordPress questions." />
        <div className="mt-14 max-w-3xl">
          <FaqSection items={faq} schema />
        </div>
        <p className="mt-10 text-sm text-muted">
          Looking for the full list? See all{" "}
          <Link href="/services" className="underline underline-offset-4 hover:text-ink">
            services
          </Link>
          .
        </p>
      </Section>
      <CtaBlock />
    </>
  );
}
