"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BookingSummaryCard from "@/components/BookingSummaryCard";
import ButtonPrimary from "@/components/ButtonPrimary";
import { useBooking } from "@/store/booking-context";

function fmtDate(iso: string) { return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }); }
function endTime(t: string, d: number) { const [h, m] = t.split(":").map(Number); return `${String((h + d) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
interface CB { booking_id: string; table_name: string; hall: string; date: string; time: string; duration: number; booking_fee: number; price_per_hour: number; customer_name: string; phone: string; }

export default function SuccessPage() {
  const router = useRouter();
  const { reset } = useBooking();
  const [bk, setBk] = useState<CB | null>(null);

  useEffect(() => { const r = sessionStorage.getItem("confirmed_booking"); if (r) setBk(JSON.parse(r)); else router.replace("/"); }, [router]);

  const addCal = () => {
    if (!bk) return;
    const s = new Date(`${bk.date}T${bk.time}:00`); const e = new Date(s.getTime() + (bk.duration || 4) * 3600000);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:Бильярд — ${bk.table_name}`, "END:VEVENT", "END:VCALENDAR"].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = `booking-${bk.booking_id}.ics`; a.click();
  };

  if (!bk) return null;
  return (
    <div className="mx-auto max-w-[430px] px-4 flex flex-col items-center justify-center min-h-dvh py-8 animate-fade-in">
      <div className="relative mb-6"><div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F8CFF]/20 to-[#34D399]/20 border-2 border-emerald-500/30 flex items-center justify-center"><svg className="w-12 h-12 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" className="animate-check" /></svg></div><div className="absolute inset-0 rounded-full animate-pulse-ring" /></div>
      <h1 className="text-xl font-black mb-1">Бронь подтверждена!</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">#{bk.booking_id}</p>
      <div className="w-full mb-6"><BookingSummaryCard items={[{ label: "Стол", value: bk.table_name }, { label: "Зал", value: bk.hall }, { label: "Дата", value: fmtDate(bk.date) }, { label: "Время", value: bk.duration === 0 ? `с ${bk.time} — до закрытия` : `${bk.time} — ${endTime(bk.time, bk.duration)}` }, { label: "Клиент", value: bk.customer_name }, { label: "Телефон", value: bk.phone }, { label: "Оплачено (бронь)", value: `${(bk.booking_fee || 1000).toLocaleString()} ₸`, highlight: true }]} /></div>
      <button onClick={addCal} className="w-full h-12 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] active:scale-[0.98] transition-transform mb-3 flex items-center justify-center gap-2">📅 Добавить в календарь</button>
      <div className="w-full space-y-3">
        <ButtonPrimary onClick={() => { sessionStorage.removeItem("confirmed_booking"); reset(); router.push("/booking"); }}>НОВОЕ БРОНИРОВАНИЕ</ButtonPrimary>
        <button onClick={() => { sessionStorage.removeItem("confirmed_booking"); reset(); router.push("/"); }} className="w-full h-12 text-sm font-semibold text-[var(--color-muted)]">На главную</button>
      </div>
    </div>
  );
}

