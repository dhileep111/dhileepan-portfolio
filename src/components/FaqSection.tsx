import { faqs } from "@/content/faq";
import type { Faq } from "@/content/faq";
import { JsonLd } from "./JsonLd";

export function FaqSection({ items = faqs, schema = false }: { items?: Faq[]; schema?: boolean }) {
  return (
    <div className="divide-y-2 divide-ink border-y-2 border-ink">
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-bold tracking-tight [&::-webkit-details-marker]:hidden">
            {f.q}
            <span
              aria-hidden="true"
              className="relative size-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-ink after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:bg-ink after:transition-transform group-open:after:scale-y-0"
            />
          </summary>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
