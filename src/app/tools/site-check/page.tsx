import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { SiteCheck } from "@/components/SiteCheck";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Site Check — Speed, Phone & SEO Basics",
  description:
    "Paste your website address and get a plain-language check of how fast it loads on a phone, whether it works on mobile, and whether the SEO basics are in place.",
  path: "/tools/site-check",
});

export default function SiteCheckPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Site check", path: "/tools/site-check" }]}
        eyebrow="Free tool"
        art="analytics"
        title="How does your website look to a visitor on a phone?"
        intro="Paste your address. In under a minute you'll see how fast it loads, whether it works on mobile and whether the search basics are in place, in plain language."
      />
      <Section tone="alt" className="!pt-14">
        <div className="max-w-4xl">
          <SiteCheck />
        </div>
      </Section>
    </>
  );
}
