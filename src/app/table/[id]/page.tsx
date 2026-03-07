"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SectionLabel from "@/components/SectionLabel";
import SlotGrid from "@/components/SlotGrid";
import BookingForm from "@/components/BookingForm";
import BookingSummaryCard from "@/components/BookingSummaryCard";
import ButtonPrimary from "@/components/ButtonPrimary";
import { useBooking } from "@/store/booking-context";
import type { Slot } from "@/types";

function fmtDate(iso: string) { return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }); }
function endTime(t: string, dur: number) { const [h, m] = t.split(":").map(Number); return `${String((h + dur) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }

export default function TablePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, selectSlot } = useBooking();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!state.tableId || state.tableId !== id) router.replace("/booking"); }, [state.tableId, id, router]);
  useEffect(() => { if (id && state.date) { setSlots(null); fetch(`/api/slots?table_id=${id}&date=${state.date}`).then(r => r.json()).then(setSlots); } }, [id, state.date]);

  const dur = state.duration;
  const isOpen = dur === 0;
  const total = isOpen ? 0 : state.pricePerHour * dur;
  const ok = state.slotTime && name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 11;

  const handleBook = async () => {
    if (!ok) return; setLoading(true);
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table_id: id, date: state.date, start_time: state.slotTime, duration: dur, customer_name: name.trim(), phone: phone.replace(/\D/g, "") }) });
      const data = await res.json();
      if (data.booking_id) {
        sessionStorage.setItem("pending_booking", JSON.stringify({ booking_id: data.booking_id, table_name: state.tableName, hall: state.hallType === "vip" ? "VIP зал" : "Основной зал", date: state.date, time: state.slotTime, duration: dur, price: total, customer_name: name.trim(), phone }));
        router.push("/payment");
      }
    } catch { alert("Ошибка. Попробуйте снова."); } finally { setLoading(false); }
  };

  if (!state.tableId) return null;

  return (
    <div className="mx-auto max-w-[430px] px-4 pb-8 animate-fade-in">
      <Header title={state.tableName || "Стол"} showBack subtitle={state.hallType === "vip" ? "VIP зал" : "Основной зал"} />
      <div className="relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F8CFF]/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#34D399]/10 border border-[var(--color-border)] flex items-center justify-center text-3xl">{state.hallType === "vip" ? "👑" : "🎱"}</div>
          <div><h2 className="font-bold text-lg">{state.tableName}</h2><p className="text-sm text-[var(--color-muted)]">{fmtDate(state.date)}</p><p className="text-sm font-semibold text-[#34D399] mt-0.5">{state.pricePerHour.toLocaleString()} ₸/час • {dur === 0 ? "Открытый" : `${dur} ч`}</p></div>
        </div>
      </div>

      <SectionLabel>Выберите время</SectionLabel>
      <div className="mb-4"><SlotGrid slots={slots || []} selectedTime={state.slotTime} duration={dur} onSelect={selectSlot} loading={slots === null} /></div>
      <div className="flex items-center gap-4 mb-6 text-[11px] text-[var(--color-muted)]">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/30" /><span>Свободно</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500/30" /><span>Занято</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-600/30" /><span>Недоступно</span></div>
      </div>

      {state.slotTime && (
        <div className="animate-slide-up space-y-6">
          <div><SectionLabel>Детали</SectionLabel><BookingSummaryCard items={[{ label: "Стол", value: state.tableName || "" }, { label: "Дата", value: fmtDate(state.date) }, { label: "Время", value: isOpen ? `с ${state.slotTime} — до закрытия` : `${state.slotTime} — ${endTime(state.slotTime, dur)}` }, { label: "Длительность", value: isOpen ? "Открытый счёт" : `${dur} ч` }, { label: "Стоимость", value: isOpen ? "По факту" : `${total.toLocaleString()} ₸`, highlight: true }]} /></div>
          <div><SectionLabel>Ваши данные</SectionLabel><BookingForm name={name} phone={phone} onNameChange={setName} onPhoneChange={setPhone} /></div>
          <ButtonPrimary onClick={handleBook} disabled={!ok} loading={loading}>{isOpen ? "ЗАБРОНИРОВАТЬ — Открытый счёт" : `ЗАБРОНИРОВАТЬ — ${total.toLocaleString()} ₸`}</ButtonPrimary>
        </div>
      )}
    </div>
  );
}

