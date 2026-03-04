"use client";

export default function AdminSettingsPage() {
  return (
    <div className="pb-20 sm:pb-4 animate-fade-in">
      <h1 className="text-xl font-black mb-6">⚙️ Настройки</h1>
      <div className="space-y-4">
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
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Цены по залам</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Основной зал</span><span className="font-semibold text-[#34D399]">3 000 — 3 500 ₸/час</span></div>
            <div className="h-px bg-[var(--color-border)]" />
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">VIP зал</span><span className="font-semibold text-[#34D399]">5 000 — 6 000 ₸/час</span></div>
          </div>
        </div>
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

