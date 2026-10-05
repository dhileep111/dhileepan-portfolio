import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { ServiceCard } from "@/components/ServiceCard";
import { CtaBlock } from "@/components/CtaBlock";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { services } from "@/content/services";
import { absoluteUrl, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services — SEO, Ads, Analytics, Websites & AI",
  description:
    "SEO, Google Ads, Meta Ads, analytics and tracking, websites and landing pages, and AI automation — delivered hands-on by one independent specialist.",
  path: "/services",
});

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.summary,
        provider: { "@id": absoluteUrl("/#person") },
        areaServed: "Worldwide",
      },
    })),
  };
  return (
    <>
      <JsonLd data={schema} />
      <PageHeader
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Services"
        title="Six disciplines. One accountable person."
        intro={`Each service stands alone, but they work best together. I handle the strategy and the hands-on work, so there is no hand-off between teams. Working remotely from ${site.location.region}, India.`}
      />
      <Section tone="alt" className="!pt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 70}>
              <ServiceCard service={s} id={s.slug} as="h2" />
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBlock />
    </>
  );
}
