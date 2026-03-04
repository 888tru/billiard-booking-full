"use client";
import { useQuery } from "@tanstack/react-query";
import type { Table } from "@/types";

const STATUS_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  free: { label: "Свободен", cls: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  reserved: { label: "Забронирован", cls: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  playing: { label: "В игре", cls: "bg-[#4F8CFF]/15 text-[#4F8CFF]", dot: "bg-[#4F8CFF]" },
  paused: { label: "Пауза", cls: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
};

export default function AdminTablesPage() {
  const { data: tables } = useQuery<Table[]>({ queryKey: ["tables"], queryFn: () => fetch("/api/tables").then(r => r.json()), refetchInterval: 5000 });

  return (
    <div className="pb-20 sm:pb-4 animate-fade-in">
      <h1 className="text-xl font-black mb-6">🎱 Столы</h1>

      {!tables ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 rounded-2xl animate-shimmer" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tables.map(t => {
            const s = STATUS_STYLE[t.status] || STATUS_STYLE.free;
            return (
              <div key={t.id} className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 transition-all ${t.status === "playing" ? "ring-1 ring-[#4F8CFF]/30" : t.status === "paused" ? "ring-1 ring-orange-500/30" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-border)]/50 flex items-center justify-center text-lg">
                    {t.hall.includes("VIP") ? "👑" : "🎱"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${s.dot} ${t.status === "playing" ? "animate-pulse" : ""}`} />
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-0.5">{t.name}</h3>
                <p className="text-[11px] text-[var(--color-muted)] mb-2">{t.hall}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                  <span className="text-xs font-semibold text-[var(--color-muted)]">{t.price_per_hour.toLocaleString()} ₸</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

