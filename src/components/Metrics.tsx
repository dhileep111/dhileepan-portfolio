import type { Project } from "@/content/projects";

export function Metrics({
  metrics,
  compact = false,
}: {
  metrics: NonNullable<Project["metrics"]>;
  compact?: boolean;
}) {
  return (
    <figure className="rounded-xl bg-paper-2 p-5 sm:p-6">
      <figcaption className="eyebrow">{metrics.period}</figcaption>
      <dl className={`mt-5 grid grid-cols-2 gap-x-4 gap-y-5 ${compact ? "" : "sm:grid-cols-4"}`}>
        {metrics.items.map((m) => (
          <div key={m.label} className="flex flex-col-reverse">
            <dt className="mt-1 text-xs text-muted">{m.label}</dt>
            <dd className={`${compact ? "text-2xl" : "text-3xl sm:text-4xl"} font-medium tracking-tight`}>
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs text-muted">{metrics.note}</p>
    </figure>
  );
}
