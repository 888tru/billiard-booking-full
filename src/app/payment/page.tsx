"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SectionLabel from "@/components/SectionLabel";
import BookingSummaryCard from "@/components/BookingSummaryCard";
import PaymentCard from "@/components/PaymentCard";
import ButtonPrimary from "@/components/ButtonPrimary";

function fmtDate(iso: string) { return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }); }
function endTime(t: string, d: number) { const [h, m] = t.split(":").map(Number); return `${String((h + d) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }

interface PB { booking_id: string; table_name: string; hall: string; date: string; time: string; duration: number; price: number; customer_name: string; phone: string; }

export default function PaymentPage() {
  const router = useRouter();
  const [bk, setBk] = useState<PB | null>(null);
  const [prov, setProv] = useState("kaspi");
  const [loading, setLoading] = useState(false);

  useEffect(() => { const r = sessionStorage.getItem("pending_booking"); if (r) setBk(JSON.parse(r)); else router.replace("/booking"); }, [router]);

  const pay = async () => {
    if (!bk) return; setLoading(true);
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_id: bk.booking_id, provider: prov }) });
      const data = await res.json();
      if (data.status === "success") { sessionStorage.setItem("confirmed_booking", JSON.stringify(bk)); sessionStorage.removeItem("pending_booking"); router.push("/success"); }
    } catch { alert("Ошибка оплаты"); } finally { setLoading(false); }
  };

  if (!bk) return null;
  return (
    <div className="mx-auto max-w-[430px] px-4 pb-8 animate-fade-in">
      <Header title="Оплата" showBack subtitle="Подтвердите бронь" />
      <SectionLabel>Детали заказа</SectionLabel>
      <div className="mb-6"><BookingSummaryCard items={[{ label: "Стол", value: bk.table_name }, { label: "Зал", value: bk.hall }, { label: "Дата", value: fmtDate(bk.date) }, { label: "Время", value: `${bk.time} — ${endTime(bk.time, bk.duration)}` }, { label: "Клиент", value: bk.customer_name }, { label: "Итого", value: `${bk.price.toLocaleString()} ₸`, highlight: true }]} /></div>
      <SectionLabel>Способ оплаты</SectionLabel>
      <div className="space-y-3 mb-6">
        <PaymentCard icon={<span className="text-2xl">🔴</span>} label="Kaspi Pay" sublabel="Kaspi Bank" selected={prov === "kaspi"} onSelect={() => setProv("kaspi")} />
        <PaymentCard icon={<span className="text-xl"></span>} label="Apple Pay" sublabel="Быстрая оплата" selected={prov === "apple_pay"} onSelect={() => setProv("apple_pay")} />
        <PaymentCard icon={<span className="text-xl">G</span>} label="Google Pay" sublabel="Быстрая оплата" selected={prov === "google_pay"} onSelect={() => setProv("google_pay")} />
      </div>
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 mb-6"><div className="flex items-start gap-3"><div className="text-sm">⏱️</div><div><p className="text-xs font-semibold text-amber-400">Слот зарезервирован на 5 минут</p><p className="text-[11px] text-[var(--color-muted)]">Завершите оплату, чтобы подтвердить бронь.</p></div></div></div>
      <ButtonPrimary onClick={pay} loading={loading}>ОПЛАТИТЬ {bk.price.toLocaleString()} ₸</ButtonPrimary>
    </div>
  );
}

