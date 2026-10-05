# Dhileepan — Digital Growth & AI Systems

Next.js (App Router) · TypeScript · Tailwind CSS v4. Exported as a fully static site (`output: "export"` → `out/`).

```bash
npm install
npm run dev                      # http://localhost:3000 (localhost URL fallback is dev-only)
npm run build                    # needs NEXT_PUBLIC_SITE_URL, see below; writes ./out
```

`npm run build` first runs `scripts/launch-check.mjs`. It **fails** if `NEXT_PUBLIC_SITE_URL` is missing or is a
localhost/example URL, and **warns** about empty contact details and a missing form endpoint.

## Values still needed from the owner

| Value | Where |
| --- | --- |
| Email | `contact.email` in `src/content/site.ts` |
| WhatsApp number (digits with country code) | `contact.whatsapp` |
| LinkedIn URL | `contact.linkedin` |
| GitHub URL (optional) | `contact.github` |
| Production URL | `NEXT_PUBLIC_SITE_URL` (or repo variable `SITE_URL` in GitHub) |
| Form service endpoint | `NEXT_PUBLIC_FORM_ENDPOINT` (or repo variable `FORM_ENDPOINT`) |

Empty contact values are hidden everywhere. With no form endpoint the form opens the visitor's email app
(needs `contact.email`); with neither it says the form isn't connected.

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `out/` on every push to `main`.

- Default: `https://<user>.github.io/<repo>` with base path `/<repo>` (computed in the workflow).
- Repo named `<user>.github.io`: served from the root, no base path.
- Custom domain: add the repository variable `SITE_URL=https://yourdomain.com`; the base path is then empty.
  Also add a `public/CNAME` file containing the bare domain.

## Content rules

- Results are hidden for now. The verified May 2026 figures sit commented out in `src/content/projects.ts`; uncomment `metrics` to show them.
- Website screenshots: capture the **public page only** (no tabs, extensions, logins or dashboards), then run
  `python scripts/process-screenshots.py <raw.png> <project-slug> <name> [--top PX]`. It writes a 1600×1000 WebP to
  `public/projects/<slug>/<name>.webp`. Names expected: `vethathiri-kundalini-yoga/vethathiri`, `vethathiri-kundalini-yoga/kundalini`. Images appear (in a browser frame) automatically once the file exists; missing files render nothing.
- Case-study sections render only if filled in. Project pages with no case-study content are `noindex` and
  excluded from `sitemap.xml`; they become indexable once `caseStudy.overview`, `challenge` or `outcome` is added.
- Screenshots go in `public/projects/<slug>/` and are listed in `evidence` (real width/height, alt text).
  With static export, `images.unoptimized` is on; keep screenshots reasonably sized.

## Structure

```
src/app            routes, sitemap.ts, robots.ts, icon.svg
src/components     Header, Footer, Hero, cards, ContactForm, JsonLd, ...
src/content        site, services, projects, process/tools data
src/lib/seo.ts     metadata + breadcrumb helpers
public/og.png      social-share image (1200×630)
scripts/           launch-check.mjs
```
