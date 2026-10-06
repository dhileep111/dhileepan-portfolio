import type { MetadataRoute } from "next";
import { isPublishedCaseStudy, projects } from "@/content/projects";
import { absoluteUrl } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["/", "/services", "/work", "/about", "/process", "/wordpress-seo", "/contact"];
  return [
    ...pages.map((p) => ({
      url: absoluteUrl(p),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : 0.8,
    })),
    // Only case studies with real content are listed (others are noindex).
    ...projects.filter(isPublishedCaseStudy).map((p) => ({
      url: absoluteUrl(`/work/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
