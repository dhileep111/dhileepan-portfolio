/**
 * Central site configuration. Edit this file to update identity and contact
 * details. Any contact value left as an empty string is simply not shown.
 */
export const site = {
  name: "Dhileepan",
  positioning: "Digital Growth & AI Systems",
  jobTitle: "Independent digital growth & AI systems professional",
  /**
   * Set NEXT_PUBLIC_SITE_URL (e.g. https://yourdomain.com). The localhost
   * fallback exists for `next dev` only; production builds are blocked by
   * scripts/launch-check.mjs if the variable is missing.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Digital growth systems built for real businesses.",
  description:
    "I help businesses grow through SEO, paid advertising, analytics and AI-powered marketing systems. Independent, based in Tamil Nadu, India, working with businesses remotely.",
  location: { region: "Tamil Nadu", country: "India", remote: true },
  contact: {
    // PLACEHOLDERS: not provided yet. Empty values are hidden everywhere on the site.
    email: "", // e.g. "name@yourdomain.com"
    whatsapp: "", // digits only with country code, e.g. "91XXXXXXXXXX"
    linkedin: "", // full profile URL
    github: "", // optional, full profile URL
  },
  /** Optional endpoint for the contact form (see .env.example). */
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
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
