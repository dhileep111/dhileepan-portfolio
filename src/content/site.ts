/**
 * Central site configuration. Edit this file to update identity and contact
 * details. Any contact value left as an empty string is simply not shown.
 */
/**
 * Public site URL, in order of preference:
 *  1. NEXT_PUBLIC_SITE_URL: set explicitly once you pick a domain.
 *  2. Vercel's stable production domain (VERCEL_PROJECT_PRODUCTION_URL). Never VERCEL_URL:
 *     that changes on every deployment and would break canonicals and the sitemap.
 *  3. localhost, for `next dev` only (production builds are blocked by launch-check.mjs).
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Dhileepan",
  positioning: "Digital Growth & AI Systems",
  jobTitle: "Independent digital growth & AI systems professional",
  url: resolveSiteUrl().replace(/\/$/, ""),
  tagline: "Digital growth systems built for real businesses.",
  description:
    "I help businesses grow through SEO, paid advertising, analytics and AI-powered marketing systems. Independent, based in Tamil Nadu, India, working with businesses remotely.",
  location: { region: "Tamil Nadu", country: "India", remote: true },
  contact: {
    // Empty values are hidden everywhere on the site.
    email: "dhileepanudayakumar@gmail.com",
    whatsapp: "916379026089", // India (+91), digits only
    linkedin: "https://www.linkedin.com/in/dhileepanudhayakumar/",
    github: "", // optional, full profile URL
  },
  /** Optional endpoint for the contact form (see .env.example). */
  // Formspree endpoint (public by design, it is visible in any form on the web).
  // NEXT_PUBLIC_FORM_ENDPOINT overrides it if set.
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || "https://formspree.io/f/mdeakkpw",
  credibility: ["SEO", "Google Ads", "Meta Ads", "Analytics", "AI Automation"],
} as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Selected Work" },
  { href: "/about", label: "About" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
] as const;

export const ogImage = {
  path: "/og.png",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

export function absoluteUrl(path = "/") {
  return `${site.url}${path}`;
}

export function whatsappUrl() {
  return site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}` : "";
}
