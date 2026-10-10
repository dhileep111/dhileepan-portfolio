import { existsSync } from "node:fs";
import path from "node:path";

/** Build-time check: does /public/<src> exist? Lets screenshots be optional. */
export function publicFileExists(src: string) {
  return existsSync(path.join(process.cwd(), "public", src));
}

/** Public asset URL. Served from the site root, so this is the path itself. */
export function assetUrl(src: string) {
  return src;
}
