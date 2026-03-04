"use client";
export default function BookingForm({ name, phone, onNameChange, onPhoneChange }: { name: string; phone: string; onNameChange: (v: string) => void; onPhoneChange: (v: string) => void }) {
  function fmt(v: string) { const d = v.replace(/\D/g, ""); if (!d.length) return ""; let f = "+7"; if (d.length > 1) f += " (" + d.slice(1, 4); if (d.length > 4) f += ") " + d.slice(4, 7); if (d.length > 7) f += "-" + d.slice(7, 9); if (d.length > 9) f += "-" + d.slice(9, 11); return f; }
  const ic = "w-full h-12 px-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-white text-sm placeholder:text-gray-500 outline-none focus:border-[#4F8CFF]/60 transition-colors";
  return (
    <div className="space-y-3">
      <div><label className="text-xs text-[var(--color-muted)] mb-1.5 block font-medium">Ваше имя</label><input type="text" value={name} onChange={e => onNameChange(e.target.value)} placeholder="Введите имя" className={ic} /></div>
      <div><label className="text-xs text-[var(--color-muted)] mb-1.5 block font-medium">Телефон</label><input type="tel" value={phone} onChange={e => onPhoneChange(fmt(e.target.value))} placeholder="+7 (___) ___-__-__" inputMode="tel" className={ic} /></div>
    </div>
  );
}

