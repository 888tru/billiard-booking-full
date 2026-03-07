"use client";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/components/ButtonPrimary";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-[430px] px-4 flex flex-col items-center justify-center min-h-dvh py-8 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#34D399]/20 border border-[var(--color-border)] flex items-center justify-center"><span className="text-5xl">🎱</span></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--color-bg)] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-1">BILLIARD CLUB</h1>
      <p className="text-[var(--color-muted)] text-sm mb-6">ул. Ауэзова 123, Алматы</p>
      <div className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-semibold text-emerald-400">Открыто</span></div><span className="text-xs text-[var(--color-muted)]">Ежедневно</span></div>
        <div className="flex items-center justify-between"><div><p className="text-xs text-[var(--color-muted)] mb-0.5">Часы работы</p><p className="font-bold text-lg">12:00 — 04:00</p></div><div className="text-right"><p className="text-xs text-[var(--color-muted)] mb-0.5">Телефон</p><p className="font-semibold text-sm">+7 (777) 123-45-67</p></div></div>
      </div>
      <div className="w-full grid grid-cols-3 gap-2 mb-8">
        {[{ i: "🎯", l: "9 столов" }, { i: "👑", l: "VIP залы" }, { i: "📱", l: "Онлайн" }].map(f => (
          <div key={f.l} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 text-center"><span className="text-xl block mb-1">{f.i}</span><span className="text-[11px] text-[var(--color-muted)] font-medium">{f.l}</span></div>
        ))}
      </div>
      <div className="w-full"><ButtonPrimary onClick={() => router.push("/booking")}>ЗАБРОНИРОВАТЬ СТОЛ</ButtonPrimary></div>
    </div>
  );
}

