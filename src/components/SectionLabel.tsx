"use client";
export default function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 ${className}`}>{children}</h2>;
}

