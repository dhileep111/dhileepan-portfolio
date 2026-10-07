import { assetUrl } from "@/lib/assets";

/**
 * Flat illustrations from unDraw (https://undraw.co/license: free for commercial use, no
 * attribution). Recoloured to the site's teal. They are decorative, so alt text is empty.
 */
const art = {
  analytics: { w: 762, h: 690 },
  "marketing-analysis": { w: 960, h: 570 },
  "search-engines": { w: 935, h: 571 },
  "idea-to-plan": { w: 960, h: 424 },
  "contact-us": { w: 960, h: 462 },
  "page-not-found": { w: 860, h: 571 },
} as const;

export type IllustrationName = keyof typeof art;

export function Illustration({
  name,
  className = "",
  priority = false,
}: {
  name: IllustrationName;
  className?: string;
  priority?: boolean;
}) {
  const { w, h } = art[name];
  return (
    <figure
      aria-hidden="true"
      className={`border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-7 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetUrl(`/illustrations/${name}.svg`)}
        alt=""
        width={w}
        height={h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
    </figure>
  );
}
