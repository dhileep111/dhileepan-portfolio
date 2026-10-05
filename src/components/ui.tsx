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
  tone?: "light" | "alt" | "dark";
  className?: string;
}) {
  const tones = {
    light: "bg-paper text-ink",
    alt: "bg-paper-2 text-ink",
    dark: "bg-ink text-paper",
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
      <p className={`eyebrow ${dark ? "!text-paper/60" : ""}`}>{eyebrow}</p>
      <Tag className={`${Tag === "h1" ? "display" : "h2"} mt-5`}>{title}</Tag>
      {intro && (
        <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${dark ? "text-paper/70" : "text-muted"}`}>
          {intro}
        </p>
      )}
    </header>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition-colors duration-200";
  const styles = {
    primary: "bg-ink text-paper hover:bg-accent",
    secondary: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
    light: "bg-paper text-ink hover:bg-accent hover:text-paper",
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
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-line px-3 py-1 font-mono text-[0.72rem] text-muted">
      {children}
    </li>
  );
}
