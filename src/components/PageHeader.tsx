import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";
import { Container } from "./ui";

export type Crumb = { name: string; path: string };

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  const all = [{ name: "Home", path: "/" }, ...crumbs];
  return (
    <div className="pb-14 pt-10 sm:pb-20 sm:pt-14">
      <JsonLd data={breadcrumbJsonLd(all)} />
      <Container>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            {all.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < all.length - 1 ? (
                  <Link prefetch={false} href={c.path} className="hover:text-ink">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="eyebrow mt-12">{eyebrow}</p>
        <h1 className="display mt-5 max-w-4xl">{title}</h1>
        {intro && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{intro}</p>}
      </Container>
    </div>
  );
}
