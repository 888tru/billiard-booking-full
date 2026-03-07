"use client";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [fee, setFee] = useState<number>(1000);
  const [editing, setEditing] = useState(false);
  const [newFee, setNewFee] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => { setFee(d.booking_fee); setNewFee(String(d.booking_fee)); });
  }, []);

  const saveFee = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_fee: Number(newFee) }) });
      const d = await res.json();
      setFee(d.booking_fee);
      setEditing(false);
    } catch { alert("Ошибка"); } finally { setSaving(false); }
  };

  return (
    <div className="pb-20 sm:pb-4 animate-fade-in">
      <h1 className="text-xl font-black mb-6">⚙️ Настройки</h1>
      <div className="space-y-4">
        {/* Booking Fee */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">💰 Цена брони</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-muted)]">Стоимость бронирования</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={newFee} onChange={e => setNewFee(e.target.value)}
                    className="w-24 h-8 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] px-2 text-right text-sm font-semibold text-white outline-none focus:border-[#4F8CFF]" />
                  <span className="text-[var(--color-muted)]">₸</span>
                </div>
              ) : (
                <span className="font-semibold text-[#34D399]">{fee.toLocaleString()} ₸</span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-muted)]">Клиент оплачивает только бронь. Стоимость игры — на месте.</p>
            <button onClick={() => editing ? saveFee() : setEditing(true)} disabled={saving}
              className={`w-full h-10 rounded-xl text-sm font-semibold transition-all ${editing ? "bg-gradient-to-r from-[#4F8CFF] to-[#34D399] text-white" : "bg-[var(--color-border)]/50 text-[var(--color-muted)] hover:text-white"}`}>
              {saving ? "Сохранение..." : editing ? "Сохранить" : "Изменить цену"}
            </button>
          </div>
        </div>

        {/* Club info */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Клуб</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Название</span><span className="font-semibold">BILLIARD CLUB</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Адрес</span><span className="font-semibold">ул. Ауэзова 123</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Часы работы</span><span className="font-semibold">12:00 — 04:00</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Телефон</span><span className="font-semibold">+7 (777) 123-45-67</span></div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Цены по залам</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Основной зал</span><span className="font-semibold text-[#34D399]">3 000 — 3 500 ₸/час</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">VIP зал</span><span className="font-semibold text-[#34D399]">5 000 — 6 000 ₸/час</span></div>
          </div>
        </div>

        {/* System */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Система</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Версия</span><span className="font-semibold">1.0.0</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Слот-система</span><span className="font-semibold">30 мин</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Защита от двойного бронирования</span><span className="font-semibold text-emerald-400">Вкл</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Блокировка слота</span><span className="font-semibold">5 минут</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Real-time обновления</span><span className="font-semibold text-emerald-400">SSE</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
