import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Filesystem blog. Posts are Markdown files in src/content/blog/<slug>.md with front matter:
 *   title, date (YYYY-MM-DD), excerpt   (required)
 *   updated (YYYY-MM-DD), draft: true   (optional; drafts are hidden in production)
 * Files starting with "_" are ignored (see _template.md). The filename is the URL slug.
 */
const DIR = path.join(process.cwd(), "src", "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  excerpt: string;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

function asDate(v: unknown, field: string, file: string): string {
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error(`Blog post "${file}": ${field} must be a date like 2026-01-31, got "${s}".`);
  }
  return s;
}

function readPost(file: string): (PostMeta & { body: string; draft: boolean }) | null {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  for (const key of ["title", "date", "excerpt"]) {
    if (!data[key]) throw new Error(`Blog post "${file}" is missing "${key}" in its front matter.`);
  }
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: String(data.title),
    date: asDate(data.date, "date", file),
    updated: data.updated ? asDate(data.updated, "updated", file) : undefined,
    excerpt: String(data.excerpt),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    body: content,
    draft: data.draft === true,
  };
}

function files() {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f.toLowerCase() !== "readme.md");
}

export function getAllPosts(): PostMeta[] {
  const showDrafts = process.env.NODE_ENV !== "production";
  return files()
    .map(readPost)
    .filter((p): p is NonNullable<typeof p> => p !== null && (showDrafts || !p.draft))
    .map(({ body: _b, draft: _d, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const file = `${slug}.md`;
  if (!files().includes(file)) return null;
  const p = readPost(file);
  if (!p || (p.draft && process.env.NODE_ENV === "production")) return null;
  const { body, draft: _d, ...meta } = p;
  return { ...meta, html: marked.parse(body, { async: false }) as string };
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
