// Runs before `npm run build`. Blocks builds with a missing/localhost site URL
// and prints warnings for launch values that are still placeholders.
import { readFileSync } from "node:fs";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const errors = [];
const warnings = [];

if (!url) errors.push("NEXT_PUBLIC_SITE_URL is not set (e.g. https://yourdomain.com).");
else if (!/^https:\/\//.test(url) || /localhost|127\.0\.0\.1|example\.com/.test(url))
  errors.push(`NEXT_PUBLIC_SITE_URL must be your real https URL, got "${url}".`);

if (!process.env.NEXT_PUBLIC_FORM_ENDPOINT)
  warnings.push("NEXT_PUBLIC_FORM_ENDPOINT is not set: the contact form will fall back to the visitor's email app (needs contact.email) or show 'not connected'.");

const site = readFileSync("src/content/site.ts", "utf8");
for (const key of ["email", "whatsapp", "linkedin"])
  if (new RegExp(`${key}:\s*""`).test(site)) warnings.push(`contact.${key} is empty in src/content/site.ts (hidden on the site).`);

warnings.forEach((w) => console.warn(`⚠  launch-check: ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`✖  launch-check: ${e}`));
  process.exit(1);
}
console.log("launch-check: site URL OK ->", url);
