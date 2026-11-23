import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs font-medium uppercase tracking-widest text-tertiary">{children}</p>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" }) {
  const style =
    variant === "primary"
      ? "bg-primary text-dark hover:brightness-105"
      : "border-2 border-dark text-dark hover:bg-dark hover:text-light";
  return (
    <a href={href} className={`press inline-flex min-h-12 items-center justify-center rounded-xl px-6 font-display text-base font-bold ${style}`}>
      {children}
    </a>
  );
}

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-dark/15 border-y border-dark/15">
      {faqs.map((f) => (
        <details key={f.q} className="group py-2">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
            {f.q}
            <span aria-hidden="true" className="text-2xl text-tertiary transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="pb-4 text-dark/80">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
