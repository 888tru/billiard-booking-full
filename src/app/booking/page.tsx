"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import Header from "@/components/Header";
import SectionLabel from "@/components/SectionLabel";
import TableCard from "@/components/TableCard";
import ButtonPrimary from "@/components/ButtonPrimary";
import { useBooking } from "@/store/booking-context";
import type { Table } from "@/types";

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtISO(d: Date) { return d.toISOString().split("T")[0]; }
function fmtDayLong(d: Date) { return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); }

const DURS = [1, 2, 3, 0];
const DL: Record<number, string> = { 1: "1 час", 2: "2 часа", 3: "3 часа", 0: "Открытый" };

// ---- Calendar helpers ----
function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWd = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { startWd, daysInMonth };
}
const MONTH_NAMES = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WD_NAMES = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function CalendarMonth({ year, month, selected, today, onSelect }: { year: number; month: number; selected: string; today: string; onSelect: (v: string) => void }) {
  const { startWd, daysInMonth } = getMonthDays(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWd; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div>
      <h3 className="text-center text-sm font-bold mb-3">{MONTH_NAMES[month]} {year}</h3>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WD_NAMES.map(w => <div key={w} className="text-center text-[10px] text-[var(--color-muted)] font-semibold py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isPast = iso < today;
          const isSel = iso === selected;
          const isToday = iso === today;
          return (
            <button key={iso} disabled={isPast} onClick={() => onSelect(iso)}
              className={`h-9 rounded-lg text-xs font-semibold transition-all
                ${isSel ? "bg-gradient-to-r from-[#4F8CFF] to-[#34D399] text-white shadow-lg" : ""}
                ${isToday && !isSel ? "border border-[#4F8CFF]/50 text-[#4F8CFF]" : ""}
                ${!isSel && !isToday && !isPast ? "text-white hover:bg-[var(--color-border)]" : ""}
                ${isPast ? "text-gray-600 cursor-not-allowed" : "active:scale-90"}
              `}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const { state, setDate, setDuration, setHallType, selectTable } = useBooking();
  const [tables, setTables] = useState<Table[] | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const todayISO = useMemo(() => fmtISO(new Date()), []);
  const tomorrowISO = useMemo(() => fmtISO(addDays(new Date(), 1)), []);

  // Determine which date label to show for "Выбрать дату" when a custom date is picked
  const isCustomDate = state.date !== todayISO && state.date !== tomorrowISO;
  const customDateLabel = isCustomDate ? fmtDayLong(new Date(state.date + "T00:00:00")) : "Выбрать дату";

  // Calendar months: current + next
  const calMonths = useMemo(() => {
    const now = new Date();
    return [
      { year: now.getFullYear(), month: now.getMonth() },
      { year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), month: (now.getMonth() + 1) % 12 },
    ];
  }, []);

  useEffect(() => { fetch("/api/tables").then(r => r.json()).then(setTables); }, []);

  // Close calendar on outside click
  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  const filtered = useMemo(() => {
    if (!tables) return null;
    return tables.filter(t => state.hallType === "vip" ? t.hall.includes("VIP") : !t.hall.includes("VIP"));
  }, [tables, state.hallType]);

  const handleCalendarSelect = (iso: string) => {
    setDate(iso);
    setShowCalendar(false);
  };

  return (
    <div className="mx-auto max-w-[430px] px-4 pb-28 animate-fade-in">
      <Header title="Бронирование" showBack subtitle="Выберите параметры" />

      {/* ---- ДАТА ---- */}
      <SectionLabel>Дата</SectionLabel>
      <div className="grid grid-cols-4 gap-2 mb-6 relative">
        {/* Сегодня — spans 2 columns */}
        <button onClick={() => { setDate(todayISO); setShowCalendar(false); }}
          className={`col-span-2 h-14 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all
            ${state.date === todayISO ? "bg-gradient-to-b from-[#4F8CFF]/20 to-[#4F8CFF]/5 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>
          <span className={`text-[10px] font-semibold uppercase ${state.date === todayISO ? "text-[#4F8CFF]" : "text-[var(--color-muted)]"}`}>Сегодня</span>
          <span className="text-sm mt-0.5">{fmtDayLong(new Date())}</span>
        </button>

        {/* Завтра */}
        <button onClick={() => { setDate(tomorrowISO); setShowCalendar(false); }}
          className={`col-span-1 h-14 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all
            ${state.date === tomorrowISO ? "bg-gradient-to-b from-[#4F8CFF]/20 to-[#4F8CFF]/5 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>
          <span className={`text-[10px] font-semibold uppercase ${state.date === tomorrowISO ? "text-[#4F8CFF]" : "text-[var(--color-muted)]"}`}>Завтра</span>
          <span className="text-[11px] mt-0.5">{fmtDayLong(addDays(new Date(), 1))}</span>
        </button>

        {/* Выбрать дату */}
        <button onClick={() => setShowCalendar(!showCalendar)}
          className={`col-span-1 h-14 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all
            ${isCustomDate ? "bg-gradient-to-b from-[#4F8CFF]/20 to-[#4F8CFF]/5 border-[#4F8CFF]/50 text-white" : showCalendar ? "bg-[var(--color-card)] border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>
          <span className="text-base">📅</span>
          <span className="text-[10px] mt-0.5 leading-tight">{isCustomDate ? customDateLabel : "Дата"}</span>
        </button>

        {/* Calendar dropdown */}
        {showCalendar && (
          <div ref={calRef} className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-2xl shadow-black/50 animate-slide-up">
            <div className="space-y-6">
              {calMonths.map(cm => (
                <CalendarMonth key={`${cm.year}-${cm.month}`} year={cm.year} month={cm.month} selected={state.date} today={todayISO} onSelect={handleCalendarSelect} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- ДЛИТЕЛЬНОСТЬ ---- */}
      <SectionLabel>Длительность</SectionLabel>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {DURS.map(d => {
          const a = state.duration === d;
          return (
            <button key={d} onClick={() => setDuration(d)}
              className={`h-12 rounded-xl border text-sm font-semibold transition-all
                ${a ? "bg-gradient-to-r from-[#4F8CFF]/20 to-[#34D399]/10 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>
              {DL[d]}
            </button>
          );
        })}
      </div>

      {/* ---- ТИП ЗАЛА ---- */}
      <SectionLabel>Тип зала</SectionLabel>
      <div className="flex gap-2 mb-6">
        {(["main", "vip"] as const).map(h => {
          const a = state.hallType === h;
          return <button key={h} onClick={() => setHallType(h)} className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${a ? "bg-gradient-to-r from-[#4F8CFF]/15 to-[#34D399]/10 border-[#4F8CFF]/50 text-white" : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted)] active:scale-95"}`}>{h === "vip" ? "👑 VIP зал" : "🎱 Основной"}</button>;
        })}
      </div>

      {/* ---- СТОЛЫ ---- */}
      <SectionLabel>Выберите стол</SectionLabel>
      <div className="space-y-3 mb-6">
        {filtered === null
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)
          : filtered.length === 0
            ? <p className="text-center py-8 text-[var(--color-muted)] text-sm">Нет столов</p>
            : filtered.map(t => <TableCard key={t.id} table={t} date={state.date} duration={state.duration} selected={state.tableId === t.id} onSelect={() => selectTable(t.id, t.name, t.price_per_hour)} />)
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
