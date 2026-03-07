"use client";
import type { Slot } from "@/types";
export default function SlotGrid({ slots, selectedTime, duration, onSelect, loading }: { slots: Slot[]; selectedTime: string | null; duration: number; onSelect: (t: string) => void; loading?: boolean }) {
  if (loading) return <div className="grid grid-cols-4 gap-2">{Array.from({length:16}).map((_,i) => <div key={i} className="h-11 rounded-xl animate-shimmer"/>)}</div>;
  if (!slots.length) return <div className="text-center py-8 text-[var(--color-muted)] text-sm">Нет доступных слотов</div>;
  const isOpen = duration === 0;
  const need = isOpen ? 1 : Math.max(1, duration) * 2;
  const canBook = (i: number) => {
    if (isOpen) return slots[i].available;
    for (let j = 0; j < need; j++) { if (!slots[i+j]?.available) return false; } return true;
  };
  const inRange = (i: number) => {
    if (!selectedTime) return false;
    const si = slots.findIndex(s => s.time === selectedTime);
    if (si < 0) return false;
    if (isOpen) {
      // Open time: highlight from selected slot to end of available slots
      return i >= si && slots[i].available;
    }
    return i >= si && i < si + need;
  };
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((s, i) => {
        const ok = canBook(i); const sel = s.time === selectedTime; const range = inRange(i);
        let cls = "bg-[var(--color-card)] border-[var(--color-border)] text-gray-500";
        if (!s.available) cls = "bg-red-500/10 border-red-500/20 text-red-400/60";
        else if (sel) cls = "bg-gradient-to-r from-[#4F8CFF] to-[#34D399] border-transparent text-white shadow-[0_0_16px_rgba(79,140,255,0.4)] animate-slot-pop";
        else if (range) cls = "bg-[#4F8CFF]/20 border-[#4F8CFF]/40 text-white";
        else if (ok) cls = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
        return <button key={s.time} disabled={!s.available || !ok} onClick={() => onSelect(s.time)} className={`h-11 rounded-xl text-sm font-semibold border transition-all ${cls} ${s.available && ok ? "active:scale-95" : "cursor-not-allowed"}`}>{s.time}</button>;
      })}
    </div>
  );
}

