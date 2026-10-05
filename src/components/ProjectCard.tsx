import Link from "next/link";
import type { Project } from "@/content/projects";
import { Arrow, Tag } from "./ui";
import { Metrics } from "./Metrics";
import { BrowserFrame } from "./BrowserFrame";
import { publicFileExists } from "@/lib/assets";

export function ProjectCard({
  project,
  index,
  as: H = "h3",
}: {
  project: Project;
  index: number;
  as?: "h2" | "h3";
}) {
  const shot = project.sites?.find((s) => publicFileExists(s.image));
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-paper p-7 transition-colors duration-300 hover:border-ink sm:p-8">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</p>
        <p className="eyebrow">{project.industry}</p>
      </div>
      <H className="mt-8 text-2xl font-medium tracking-tight sm:text-3xl">{project.name}</H>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{project.description}</p>

      <ul aria-label="Services" className="mt-6 flex flex-wrap gap-2">
        {project.services.map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </ul>

      {shot && (
        <div className="mt-6">
          <BrowserFrame site={shot} />
        </div>
      )}

      {project.metrics && (
        <div className="mt-6">
          <Metrics metrics={project.metrics} compact />
        </div>
      )}

      <div className="mt-auto pt-8">
        <Link
          prefetch={false}
          href={`/work/${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium after:absolute after:inset-0 after:content-['']"
        >
          View Project
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <Arrow />
          </span>
          <span className="sr-only"> — {project.name}</span>
        </Link>
      </div>
    </article>
  );
}
