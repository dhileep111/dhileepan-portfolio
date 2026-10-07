import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  children,
  id,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  id?: string;
  tone?: "light" | "alt" | "dark" | "signal";
  className?: string;
}) {
  const tones = {
    light: "bg-paper text-ink",
    alt: "bg-paper-2 text-ink",
    dark: "grid-bg bg-teal text-paper",
    signal: "bg-signal text-ink",
  };
  return (
    <section id={id} className={`py-20 sm:py-28 ${tones[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  as?: "h1" | "h2";
  dark?: boolean;
}) {
  return (
    <header className="max-w-3xl">
      <p className={`eyebrow ${dark ? "!text-paper/70" : ""}`}>{eyebrow}</p>
      <Tag className={`${Tag === "h1" ? "display" : "h2"} mt-5`}>{title}</Tag>
      {intro && (
        <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${dark ? "text-paper/75" : "text-muted"}`}>
          {intro}
        </p>
      )}
    </header>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** primary/secondary for light backgrounds; light/ghost for dark; dark for the yellow band. */
  variant?: "primary" | "secondary" | "light" | "ghost" | "dark";
  className?: string;
};

/** Rectangular buttons with a hard offset shadow that "presses in" on hover. */
export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-3 border-2 px-6 font-display text-[0.95rem] font-bold tracking-tight transition-[transform,box-shadow,background-color,color] duration-150";
  const styles = {
    primary:
      "border-ink bg-signal text-ink shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-ink)]",
    secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
    light:
      "border-signal bg-signal text-ink shadow-[4px_4px_0_0_var(--color-paper)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-paper)]",
    ghost: "border-paper/70 bg-transparent text-paper hover:border-paper hover:bg-paper hover:text-teal",
    dark: "border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--color-paper)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-paper)]",
  };
  return (
    <Link prefetch={false} href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Arrow() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="border border-ink/30 bg-paper px-2.5 py-1 font-display text-xs font-semibold text-muted">
      {children}
    </li>
  );
}
