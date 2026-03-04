"use client";
import type { Table, Slot } from "@/types";
import { useState, useEffect } from "react";

export default function TableCard({ table, date, duration, selected, onSelect }: { table: Table; date: string; duration: number; selected: boolean; onSelect: () => void }) {
  const [avail, setAvail] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/slots?table_id=${table.id}&date=${date}`).then(r => r.json()).then((sl: Slot[]) => {
      const n = Math.max(1, duration) * 2; let c = 0;
      for (let i = 0; i <= sl.length - n; i++) { let ok = true; for (let j = 0; j < n; j++) { if (!sl[i + j].available) { ok = false; break; } } if (ok) c++; }
      setAvail(c);
    });
  }, [table.id, date, duration]);
  const has = (avail ?? 0) > 0;
  return (
    <button onClick={onSelect} disabled={avail !== null && !has}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${selected ? "bg-[#4F8CFF]/10 border-[#4F8CFF]/50 shadow-[0_0_20px_rgba(79,140,255,0.15)]" : has || avail === null ? "bg-[var(--color-card)] border-[var(--color-border)] active:scale-[0.98]" : "bg-[var(--color-card)]/50 border-[var(--color-border)]/50 opacity-50 cursor-not-allowed"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${selected ? "bg-[#4F8CFF]/20" : "bg-[var(--color-border)]/50"}`}>
            {table.hall.includes("VIP") ? "👑" : "🎱"}
          </div>
          <div><h3 className="font-bold text-[15px]">{table.name}</h3><p className="text-xs text-[var(--color-muted)]">{table.hall}</p></div>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">{table.price_per_hour.toLocaleString()} ₸<span className="text-[var(--color-muted)] font-normal text-xs">/час</span></p>
          {avail === null ? <div className="w-16 h-3 rounded animate-shimmer mt-1" /> : <p className={`text-xs mt-0.5 ${has ? "text-emerald-400" : "text-red-400"}`}>{has ? `${avail} слотов` : "Нет мест"}</p>}
        </div>
      </div>
      {selected && <div className="mt-3 flex items-center gap-2 text-xs text-[#4F8CFF]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Выбран</div>}
    </button>
  );
}

