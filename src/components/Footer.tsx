import Link from "next/link";
import { nav, site, whatsappUrl } from "@/content/site";
import { Container } from "./ui";

export function Footer() {
  const { email, linkedin, github } = site.contact;
  const wa = whatsappUrl();
  return (
    <footer className="border-t border-line bg-paper py-14">
      <Container className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            {site.name}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {site.jobTitle}. SEO, paid advertising, analytics, websites and AI-powered
            marketing systems. Based in {site.location.region}, {site.location.country}; working with
            businesses remotely.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Navigate</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link prefetch={false} href={n.href} className="text-muted hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/wordpress-seo" className="text-muted hover:text-ink">
                WordPress SEO &amp; tracking
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Get in touch</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {email && (
              <li>
                <a href={`mailto:${email}`} className="text-muted hover:text-ink">
                  {email}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} className="text-muted hover:text-ink" rel="noopener noreferrer" target="_blank">
                  WhatsApp
                </a>
              </li>
            )}
            {linkedin && (
              <li>
                <a href={linkedin} className="text-muted hover:text-ink" rel="noopener noreferrer me" target="_blank">
                  LinkedIn
                </a>
              </li>
            )}
            {github && (
              <li>
                <a href={github} className="text-muted hover:text-ink" rel="noopener noreferrer me" target="_blank">
                  GitHub
                </a>
              </li>
            )}
            <li>
              <Link prefetch={false} href="/contact" className="text-muted hover:text-ink">
                Contact form
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="mt-12 border-t border-line pt-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
