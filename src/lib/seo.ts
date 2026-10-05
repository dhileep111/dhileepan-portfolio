import type { Metadata } from "next";
import { absoluteUrl, ogImage, site } from "@/content/site";

export const ogImages = [
  { url: absoluteUrl(ogImage.path), width: ogImage.width, height: ogImage.height, alt: ogImage.alt },
];

type PageMeta = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: site.name,
      locale: "en_IN",
      images: ogImages,
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(ogImage.path)] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function sameAsLinks() {
  return [site.contact.linkedin, site.contact.github].filter(Boolean);
}
