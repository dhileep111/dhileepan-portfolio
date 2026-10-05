import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, ogImage, site } from "@/content/site";
import { ogImages, sameAsLinks } from "@/lib/seo";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.positioning}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: absoluteUrl("/"),
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ogImages,
  },
  twitter: { card: "summary_large_image", images: [absoluteUrl(ogImage.path)] },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: site.name,
        description: site.description,
        inLanguage: "en-IN",
        publisher: { "@id": absoluteUrl("/#person") },
      },
      {
        "@type": "Person",
        "@id": absoluteUrl("/#person"),
        name: site.name,
        jobTitle: site.jobTitle,
        url: absoluteUrl("/"),
        email: site.contact.email ? `mailto:${site.contact.email}` : undefined,
        address: {
          "@type": "PostalAddress",
          addressRegion: site.location.region,
          addressCountry: "IN",
        },
        knowsAbout: [
          "Search engine optimization",
          "Google Ads",
          "Meta Ads",
          "Google Analytics 4",
          "Google Tag Manager",
          "Marketing automation",
        ],
        sameAs: sameAsLinks(),
      },
      {
        "@type": "ProfessionalService",
        "@id": absoluteUrl("/#service"),
        name: `${site.name} — Digital Growth`,
        url: absoluteUrl("/"),
        founder: { "@id": absoluteUrl("/#person") },
        areaServed: "Worldwide",
        serviceType: [
          "SEO",
          "Google Ads management",
          "Meta Ads management",
          "Analytics and tracking",
          "Website and landing page development",
          "AI and marketing automation",
        ],
      },
    ],
  };

  return (
    <html lang="en-IN" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        <JsonLd data={schema} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
