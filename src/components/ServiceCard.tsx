import type { Service } from "@/content/services";

export function ServiceCard({
  service,
  id,
  as: H = "h3",
}: {
  service: Service;
  id?: string;
  as?: "h2" | "h3";
}) {
  return (
    <article
      id={id}
      className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-7 transition-colors duration-300 hover:border-ink sm:p-8"
    >
      <p className="font-mono text-xs text-muted">{service.index}</p>
      <H className="mt-6 text-2xl font-medium tracking-tight">{service.title}</H>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{service.summary}</p>
      <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
        {service.items.map((it) => (
          <li key={it} className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-3 bg-accent" />
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}
