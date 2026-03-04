"use client";
import { useRouter } from "next/navigation";
export default function Header({ title, showBack, subtitle }: { title: string; showBack?: boolean; subtitle?: string }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 py-4 mb-2">
      {showBack && <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center active:scale-95 transition-transform"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>}
      <div className="flex-1 min-w-0"><h1 className="text-lg font-bold truncate">{title}</h1>{subtitle && <p className="text-sm text-[var(--color-muted)] truncate">{subtitle}</p>}</div>
    </header>
  );
}

