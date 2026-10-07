import { processSteps } from "@/content/misc";
import { Reveal } from "./Reveal";

export function ProcessSteps({ detailed = false, as: H = "h3" }: { detailed?: boolean; as?: "h2" | "h3" }) {
  return (
    <ol className="grid gap-[2px] overflow-hidden border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
      {processSteps.map((s, i) => (
        <li key={s.index} className="bg-paper">
          <Reveal delay={i * 70} className="h-full p-7 sm:p-8">
            <p className="font-display text-sm font-bold text-accent">{s.index}</p>
            <H className="mt-10 text-2xl font-bold tracking-tight">{s.title}</H>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
            {detailed && <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed">{s.detail}</p>}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
