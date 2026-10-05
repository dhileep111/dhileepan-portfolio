import { existsSync } from "node:fs";
import path from "node:path";

/** Build-time check: does /public/<src> exist? Lets screenshots be optional. */
export function publicFileExists(src: string) {
  return existsSync(path.join(process.cwd(), "public", src));
}

/** Prefix a public asset path with the deploy base path (GitHub Pages project sites). */
export function assetUrl(src: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
