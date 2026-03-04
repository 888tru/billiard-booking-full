"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardStats, Table, Session, Booking } from "@/types";

function elapsed(session: Session): string {
  const start = new Date(session.start_time).getTime();
  let paused = 0;
  for (const p of session.pauses) { const ps = new Date(p.start).getTime(); const pe = p.end ? new Date(p.end).getTime() : Date.now(); paused += pe - ps; }
  const ms = Math.max(0, Date.now() - start - paused);
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

const MODES = [
  { value: "open", label: "Открытый", dur: 0 },
  { value: "1h", label: "1 час", dur: 1 },
  { value: "2h", label: "2 часа", dur: 2 },
  { value: "3h", label: "3 часа", dur: 3 },
  { value: "custom", label: "Другое", dur: 0 },
] as const;

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: stats } = useQuery<DashboardStats>({ queryKey: ["dashboard"], queryFn: () => fetch("/api/dashboard").then(r => r.json()), refetchInterval: 5000 });
  const { data: tables } = useQuery<Table[]>({ queryKey: ["tables"], queryFn: () => fetch("/api/tables").then(r => r.json()) });
  const { data: sessions } = useQuery<Session[]>({ queryKey: ["sessions"], queryFn: () => fetch("/api/sessions").then(r => r.json()), refetchInterval: 3000 });
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ["bookings"], queryFn: () => fetch("/api/bookings").then(r => r.json()), refetchInterval: 5000 });

  // Start session form
  const [selTable, setSelTable] = useState("");
  const [selMode, setSelMode] = useState("open");
  const [client, setClient] = useState("");
  const [customDur, setCustomDur] = useState(1);
  const [starting, setStarting] = useState(false);

  // Live timer tick
  const [, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(i); }, []);

  const freeTables = tables?.filter(t => t.status === "free") || [];
  const activeSessions = sessions?.filter(s => s.status === "active" || s.status === "paused") || [];
  const todayBookings = bookings?.filter(b => b.date === new Date().toISOString().split("T")[0] && (b.status === "pending" || b.status === "confirmed")) || [];

  const startSession = async () => {
    if (!selTable || !client.trim()) return;
    setStarting(true);
    const mode = MODES.find(m => m.value === selMode);
    const dur = selMode === "custom" ? customDur : (mode?.dur || 0);
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table_id: selTable, client: client.trim(), mode: selMode, duration: dur }) });
    setSelTable(""); setClient(""); setStarting(false);
    qc.invalidateQueries({ queryKey: ["sessions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const sessionAction = async (id: string, action: string) => {
    await fetch("/api/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    qc.invalidateQueries({ queryKey: ["sessions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const startFromBooking = async (b: Booking) => {
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table_id: b.table_id, client: `${b.customer_name} (${b.phone})`, mode: `${b.duration}h`, duration: b.duration, booking_id: b.id }) });
    qc.invalidateQueries({ queryKey: ["sessions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["bookings"] }); qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const ic = "w-full h-10 px-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-white text-sm outline-none focus:border-[#4F8CFF]/60 transition-colors";

  return (
    <div className="pb-20 sm:pb-4 animate-fade-in">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "В игре", value: stats?.playing ?? 0, color: "text-[#4F8CFF]", icon: "🎮" },
          { label: "Брони сегодня", value: stats?.bookings_today ?? 0, color: "text-amber-400", icon: "📋" },
          { label: "На паузе", value: stats?.paused ?? 0, color: "text-orange-400", icon: "⏸️" },
          { label: "Выручка", value: `${(stats?.revenue_today ?? 0).toLocaleString()} ₸`, color: "text-[#34D399]", icon: "💰" },
        ].map(c => (
          <div key={c.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-lg">{c.icon}</span></div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Start session form */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">▶️ Начать сессию</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">Стол</label>
            <select value={selTable} onChange={e => setSelTable(e.target.value)} className={ic}>
              <option value="">Выберите стол...</option>
              {freeTables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.hall})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">Клиент</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Имя клиента" className={ic} />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-[var(--color-muted)] mb-2 block">Режим</label>
          <div className="flex flex-wrap gap-2">
            {MODES.map(m => (
              <button key={m.value} onClick={() => setSelMode(m.value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selMode === m.value ? "bg-[#4F8CFF]/15 border-[#4F8CFF]/50 text-[#4F8CFF]" : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)]"}`}>{m.label}</button>
            ))}
          </div>
          {selMode === "custom" && <input type="number" min={1} max={12} value={customDur} onChange={e => setCustomDur(+e.target.value)} className={`${ic} mt-2 w-32`} />}
        </div>
        <button onClick={startSession} disabled={!selTable || !client.trim() || starting} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#4F8CFF] to-[#34D399] disabled:opacity-40 active:scale-[0.98] transition-all">
          {starting ? "Запуск..." : "НАЧАТЬ"}
        </button>
      </div>

      {/* Today's bookings (pending/confirmed) */}
      {todayBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">📋 Брони на сегодня</h2>
          <div className="space-y-2">
            {todayBookings.map(b => (
              <div key={b.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{b.customer_name} — {b.table_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{b.start_time} • {b.duration}ч • {b.phone}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{b.status === "confirmed" ? "Подтв." : "Ожидает"}</span>
                  <button onClick={() => startFromBooking(b)} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-[#4F8CFF]/15 text-[#4F8CFF] hover:bg-[#4F8CFF]/25 transition-colors">▶ Старт</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active sessions table */}
      <h2 className="font-bold text-base mb-3 flex items-center gap-2">🎮 Активные сессии</h2>
      {activeSessions.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center text-[var(--color-muted)] text-sm">Нет активных сессий</div>
      ) : (
        <div className="space-y-3">
          {activeSessions.map(s => {
            const el = elapsed(s);
            const isPaused = s.status === "paused";
            return (
              <div key={s.id} className={`bg-[var(--color-card)] border rounded-2xl p-4 transition-all ${isPaused ? "border-orange-500/30" : "border-[var(--color-border)]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isPaused ? "bg-orange-500/15" : "bg-[#4F8CFF]/15"}`}>
                      {isPaused ? "⏸️" : "▶️"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{s.table_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{s.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-black text-lg ${isPaused ? "text-orange-400 animate-flash" : "text-white"}`}>{el}</p>
                    <p className="text-[10px] text-[var(--color-muted)] uppercase font-semibold">{s.mode === "open" ? "Открытый" : `${s.duration}ч`}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {s.status === "active" && (
                    <button onClick={() => sessionAction(s.id, "pause")} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 active:scale-[0.97] transition-all">⏸ Пауза</button>
                  )}
                  {s.status === "paused" && (
                    <button onClick={() => sessionAction(s.id, "resume")} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 active:scale-[0.97] transition-all">▶ Продолжить</button>
                  )}
                  <button onClick={() => sessionAction(s.id, "finish")} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 active:scale-[0.97] transition-all">⏹ Завершить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



