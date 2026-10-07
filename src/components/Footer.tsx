import Link from "next/link";
import { nav, site, whatsappUrl } from "@/content/site";
import { Container } from "./ui";

const linkCls = "text-paper/75 underline-offset-4 hover:text-signal hover:underline";

export function Footer() {
  const { email, linkedin, github } = site.contact;
  const wa = whatsappUrl();
  return (
    <footer className="border-t-2 border-ink bg-teal-2 py-14 text-paper">
      <Container className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            {site.name}
            <span aria-hidden="true" className="inline-block size-2.5 border-[1.5px] border-paper bg-signal" />
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
            {site.jobTitle}. SEO, paid advertising, analytics, websites and AI-powered
            marketing systems. Based in {site.location.region}, {site.location.country}; working with
            businesses remotely.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow !text-paper/70">Navigate</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link prefetch={false} href={n.href} className={linkCls}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/wordpress-seo" className={linkCls}>
                WordPress SEO &amp; tracking
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow !text-paper/70">Get in touch</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {email && (
              <li>
                <a href={`mailto:${email}`} className={linkCls}>
                  {email}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} className={linkCls} rel="noopener noreferrer" target="_blank">
                  WhatsApp
                </a>
              </li>
            )}
            {linkedin && (
              <li>
                <a href={linkedin} className={linkCls} rel="noopener noreferrer me" target="_blank">
                  LinkedIn
                </a>
              </li>
            )}
            {github && (
              <li>
                <a href={github} className={linkCls} rel="noopener noreferrer me" target="_blank">
                  GitHub
                </a>
              </li>
            )}
            <li>
              <Link prefetch={false} href="/contact" className={linkCls}>
                Contact form
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="mt-12 border-t border-paper/20 pt-6">
        <p className="text-xs text-paper/60">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
