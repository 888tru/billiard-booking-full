"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking } from "@/types";

function fmtDate(iso: string) { return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }); }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидает", cls: "bg-amber-500/15 text-amber-400" },
  confirmed: { label: "Подтверждено", cls: "bg-emerald-500/15 text-emerald-400" },
  cancelled: { label: "Отменено", cls: "bg-red-500/15 text-red-400" },
  completed: { label: "Завершено", cls: "bg-[var(--color-border)] text-[var(--color-muted)]" },
};

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ["bookings"], queryFn: () => fetch("/api/bookings").then(r => r.json()), refetchInterval: 5000 });

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    qc.invalidateQueries({ queryKey: ["bookings"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const startSession = async (b: Booking) => {
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table_id: b.table_id, client: `${b.customer_name} (${b.phone})`, mode: `${b.duration}h`, duration: b.duration, booking_id: b.id }) });
    qc.invalidateQueries({ queryKey: ["sessions"] }); qc.invalidateQueries({ queryKey: ["bookings"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["tables"] });
  };

  return (
    <div className="pb-20 sm:pb-4 animate-fade-in">
      <h1 className="text-xl font-black mb-6">📋 Бронирования</h1>

      {!bookings ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl animate-shimmer" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center text-[var(--color-muted)] text-sm">Нет бронирований</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
            const canConfirm = b.status === "pending";
            const canCancel = b.status === "pending" || b.status === "confirmed";
            const canStart = b.status === "confirmed";
            return (
              <div key={b.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{b.customer_name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{b.phone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                  <div><span className="text-[var(--color-muted)]">Стол: </span><span className="font-semibold">{b.table_name}</span></div>
                  <div><span className="text-[var(--color-muted)]">Дата: </span><span className="font-semibold">{fmtDate(b.date)}</span></div>
                  <div><span className="text-[var(--color-muted)]">Время: </span><span className="font-semibold">{b.start_time}</span></div>
                  <div><span className="text-[var(--color-muted)]">Сумма: </span><span className="font-semibold text-[#34D399]">{b.price.toLocaleString()} ₸</span></div>
                </div>
                <div className="flex gap-2">
                  {canConfirm && <button onClick={() => updateStatus(b.id, "confirmed")} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 active:scale-[0.97]">✓ Подтвердить</button>}
                  {canStart && <button onClick={() => startSession(b)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 active:scale-[0.97]">▶ Начать игру</button>}
                  {canCancel && <button onClick={() => updateStatus(b.id, "cancelled")} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 active:scale-[0.97]">✕ Отменить</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

