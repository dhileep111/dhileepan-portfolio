# Dhileepan — Digital Growth & AI Systems

Next.js (App Router) · TypeScript · Tailwind CSS v4. Hosted on Netlify; every push to `main` deploys automatically.

```bash
npm install
npm run dev        # http://localhost:3000 (localhost URL fallback is dev-only)
npm run build      # runs scripts/launch-check.mjs first
```

`npm run build` runs `scripts/launch-check.mjs`. It **fails** if no public URL can be worked out, or if it is a
localhost/example URL, and **warns** about empty contact details and a missing form endpoint.

## Site URL

Resolved in `src/content/site.ts`, in this order:

1. `NEXT_PUBLIC_SITE_URL` — set this in Netlify (Site configuration → Environment variables) once you pick a custom domain.
2. `URL` — Netlify sets it automatically during builds (the site's main address, e.g. `*.netlify.app`). Only used when `NETLIFY=true`.
3. `http://localhost:3000` — dev only.

Do not use `DEPLOY_URL` / `DEPLOY_PRIME_URL` for canonicals or the sitemap; they are per-deploy addresses.

## Hosting (Netlify)

- Repo: `dhileep111/dhileepan-portfolio`, production branch `main`. Settings live in `netlify.toml`
  (build command, Node version and the `@netlify/plugin-nextjs` runtime that powers `/api/check`).
- Environment variables to set in Netlify: `PAGESPEED_API_KEY`, and (for the real rate limit)
  `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Custom domain later: Netlify → Domain management → Add a domain and follow the DNS steps, then set
  `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` and redeploy.
- After a domain change, add the new address as a property in Google Search Console and resubmit `sitemap.xml`.
  The verification file in `public/` works on the new address too.

## Values to maintain

| Value | Where |
| --- | --- |
| Email, WhatsApp (digits with country code), LinkedIn, GitHub | `contact` in `src/content/site.ts` (empty values are hidden) |
| Form endpoint (Formspree) | `formEndpoint` in `src/content/site.ts`; `NEXT_PUBLIC_FORM_ENDPOINT` overrides it |
| Production URL | see "Site URL" above |

## Content rules

- Results are hidden for now. The verified May 2026 figures sit commented out in `src/content/projects.ts`; uncomment `metrics` to show them.
- Website screenshots: capture the **public page only** (no tabs, extensions, logins or dashboards), then run
  `python scripts/process-screenshots.py <raw.png> <project-slug> <name> [--top PX]`. It writes a 1600px-wide WebP to
  `public/projects/<slug>/<name>.webp`. Names expected: `vethathiri-kundalini-yoga/vethathiri`, `vethathiri-kundalini-yoga/kundalini`.
  Images appear (in a browser frame) automatically once the file exists; missing files render nothing.
- Case-study sections render only if filled in. Project pages with no case-study content are `noindex` and
  excluded from `sitemap.xml`; they become indexable once `caseStudy.overview`, `challenge` or `outcome` is added.
- Illustrations are from unDraw (free for commercial use, no attribution), recoloured to the site's teal.

## Structure

```
src/app            routes, sitemap.ts, robots.ts, icon.svg
src/components     Header, Footer, Hero, cards, ContactForm, JsonLd, Illustration, ...
src/content        site, services, projects, faq, process/tools data
src/lib/seo.ts     metadata + breadcrumb helpers
public/og.png      social-share image (1200×630)
public/illustrations  unDraw SVGs used on pages
scripts/           launch-check.mjs, process-screenshots.py
```
