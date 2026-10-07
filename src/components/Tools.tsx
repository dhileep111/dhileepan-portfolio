import { toolGroups } from "@/content/misc";

export function Tools() {
  return (
    <div className="grid gap-10 md:grid-cols-3">
      {toolGroups.map((g) => (
        <div key={g.group}>
          <h3 className="eyebrow">{g.group}</h3>
          <ul className="mt-5 divide-y-2 divide-ink border-y-2 border-ink">
            {g.tools.map((t) => (
              <li key={t} className="py-3.5 text-lg tracking-tight">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
