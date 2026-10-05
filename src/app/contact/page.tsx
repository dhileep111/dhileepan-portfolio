import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { site, whatsappUrl } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact — Start a Project",
  description:
    "Tell me what you're trying to build, improve or grow. Get in touch about SEO, advertising, analytics, websites or AI automation.",
  path: "/contact",
});

export default function ContactPage() {
  const { email, linkedin } = site.contact;
  const wa = whatsappUrl();
  const hasDirect = Boolean(email || wa || linkedin);
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact"
        title="Have a project in mind?"
        intro="Tell me what you're trying to build, improve or grow."
      />
      <Section tone="alt" className="!pt-14">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-24">
          <ContactForm />
          {hasDirect && (
            <aside aria-label="Direct contact">
              <p className="eyebrow">Or reach me directly</p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {email && (
                  <li className="py-4">
                    <p className="text-xs text-muted">Email</p>
                    <a href={`mailto:${email}`} className="text-lg font-medium hover:text-accent">
                      {email}
                    </a>
                  </li>
                )}
                {wa && (
                  <li className="py-4">
                    <p className="text-xs text-muted">WhatsApp</p>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:text-accent">
                      Message on WhatsApp
                    </a>
                  </li>
                )}
                {linkedin && (
                  <li className="py-4">
                    <p className="text-xs text-muted">LinkedIn</p>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer me" className="text-lg font-medium hover:text-accent">
                      Connect on LinkedIn
                    </a>
                  </li>
                )}
              </ul>
              <p className="mt-6 text-sm text-muted">
                Based in {site.location.region}, {site.location.country}. Working with businesses remotely.
              </p>
            </aside>
          )}
        </div>
      </Section>
    </>
  );
}
