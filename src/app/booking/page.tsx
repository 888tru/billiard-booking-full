"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import SectionLabel from "@/components/SectionLabel";
import TableCard from "@/components/TableCard";
import ButtonPrimary from "@/components/ButtonPrimary";
import { useBooking } from "@/store/booking-context";
import type { Table } from "@/types";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtISO(d: Date) { return d.toISOString().split("T")[0]; }
function fmtDay(d: Date) { return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }); }
function fmtWd(d: Date) { return d.toLocaleDateString("ru-RU", { weekday: "short" }); }

const DURS = [1, 2, 3, 4, 0];
const DL: Record<number, string> = { 1:"1 час",2:"2 часа",3:"3 часа",4:"4 часа",0:"Открытый" };

export default function BookingPage() {
  const router = useRouter();
  const { state, setDate, setDuration, setHallType, selectTable } = useBooking();
  const [tables, setTables] = useState<Table[] | null>(null);

  const dates = useMemo(() => {
    const t = new Date(); return Array.from({ length: 14 }, (_, i) => { const d = addDays(t, i); return { v: fmtISO(d), day: fmtDay(d), wd: fmtWd(d), today: i === 0, tmr: i === 1 }; });
  }, []);

  useEffect(() => { fetch("/api/tables").then(r => r.json()).then(setTables); }, []);

  const filtered = useMemo(() => {
    if (!tables) return null;
    return tables.filter(t => state.hallType === "vip" ? t.hall.includes("VIP") : !t.hall.includes("VIP"));
  }, [tables, state.hallType]);

  return (
    <div className="mx-auto max-w-[430px] px-4 pb-28 animate-fade-in">
      <Header title="Бронирование" showBack subtitle="Выберите параметры" />

      <SectionLabel>Дата</SectionLabel>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-6">
        {dates.map(o => {
          const a = state.date === o.v;
          return <button key={o.v} onClick={() => setDate(o.v)} className={`flex-shrink-0 flex flex-col items-center justify-center w-[70px] h-[76px] rounded-2xl border transition-all ${a ? "bg-gradient-to-b from-[#4F8CFF]/20 to-[#4F8CFF]/5 border-[#4F8CFF]/50" : "bg-[var(--color-card)] border-[var(--color-border)] active:scale-95"}`}>
            <span className={`text-[10px] font-semibold uppercase ${a ? "text-[#4F8CFF]" : "text-[var(--color-muted)]"}`}>{o.today ? "Сегодня" : o.tmr ? "Завтра" : o.wd}</span>
            <span className={`text-sm font-bold mt-0.5 ${a ? "text-white" : "text-[var(--color-muted)]"}`}>{o.day}</span>
          </button>;
        })}
      </div>

      <SectionLabel>Длительность</SectionLabel>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-6">
        {DURS.map(d => {
          const a = state.duration === d;
          return <button key={d} onClick={() => setDuration(d)} className={`flex-shrink-0 h-10 px-4 rounded-xl border text-sm font-semibold transition-all ${a ? "bg-gradient-to-r from-[#4F8CFF]/20 to-[#34D399]/10 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>{DL[d]}</button>;
        })}
      </div>

      <SectionLabel>Тип зала</SectionLabel>
      <div className="flex gap-2 mb-6">
        {(["main", "vip"] as const).map(h => {
          const a = state.hallType === h;
          return <button key={h} onClick={() => setHallType(h)} className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${a ? "bg-gradient-to-r from-[#4F8CFF]/15 to-[#34D399]/10 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>{h === "vip" ? "👑 VIP зал" : "🎱 Основной"}</button>;
        })}
      </div>

      <SectionLabel>Выберите стол</SectionLabel>
      <div className="space-y-3 mb-6">
        {filtered === null
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)
          : filtered.length === 0
            ? <p className="text-center py-8 text-[var(--color-muted)] text-sm">Нет столов</p>
            : filtered.map(t => <TableCard key={t.id} table={t} date={state.date} duration={state.duration || 1} selected={state.tableId === t.id} onSelect={() => selectTable(t.id, t.name, t.price_per_hour)} />)
        }
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-8">
        <div className="mx-auto max-w-[430px]">
          <ButtonPrimary onClick={() => state.tableId && router.push(`/table/${state.tableId}`)} disabled={!state.tableId}>
            {state.tableId ? `Выбрать время — ${state.tableName}` : "Выберите стол"}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}

