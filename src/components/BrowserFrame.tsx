import type { Site } from "@/content/projects";
import { assetUrl } from "@/lib/assets";

/** A website screenshot inside a minimal browser frame. Image is a 1600px-wide WebP. */
export function BrowserFrame({ site, priority = false }: { site: Site; priority?: boolean }) {
  const host = new URL(site.url).host.replace(/^www\./, "");
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-paper shadow-[0_1px_0_rgba(14,15,12,0.04),0_18px_40px_-24px_rgba(14,15,12,0.35)]">
      <div className="flex items-center gap-3 border-b border-line bg-paper-2 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-line" />
          <i className="size-2.5 rounded-full bg-line" />
          <i className="size-2.5 rounded-full bg-line" />
        </span>
        <span className="truncate rounded-md bg-paper px-3 py-1 font-mono text-[0.7rem] text-muted">{host}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetUrl(site.image)}
        alt={site.alt}
        width={site.width ?? 1600}
        height={site.height ?? 1000}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
    </figure>
  );
}
