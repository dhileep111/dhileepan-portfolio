import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CtaBlock } from "@/components/CtaBlock";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Process — Understand, Diagnose, Build, Optimize",
  description:
    "A practical four-step process for digital growth work: understand the business, diagnose the system, build the fixes, and optimize against what matters.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Process", path: "/process" }]}
        eyebrow="Process"
        title="Simple, practical, hands-on."
        intro="Four steps, from first conversation to ongoing improvement. You work with me directly throughout."
      />
      <Section tone="alt" className="!pt-14">
        <ProcessSteps detailed as="h2" />
      </Section>
      <CtaBlock />
    </>
  );
}
