import type { MetadataRoute } from "next";
import { isPublishedCaseStudy, projects } from "@/content/projects";
import { absoluteUrl } from "@/content/site";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();
  const pages = ["/", "/services", "/work", "/about", "/process", "/wordpress-seo", "/tools/site-check", "/contact"];
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
    // The blog index and posts are listed once there is at least one post.
    ...(posts.length
      ? [
          {
            url: absoluteUrl("/blog"),
            lastModified: new Date(posts[0].date),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
          ...posts.map((p) => ({
            url: absoluteUrl(`/blog/${p.slug}`),
            lastModified: new Date(p.updated ?? p.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          })),
        ]
      : []),
  ];
}
