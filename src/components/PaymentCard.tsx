"use client";
export default function PaymentCard({ icon, label, sublabel, selected, onSelect }: { icon: React.ReactNode; label: string; sublabel?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selected ? "bg-[#4F8CFF]/10 border-[#4F8CFF]/50" : "bg-[var(--color-card)] border-[var(--color-border)] active:scale-[0.98]"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${selected ? "bg-[#4F8CFF]/20" : "bg-[var(--color-border)]/50"}`}>{icon}</div>
      <div className="flex-1 text-left"><p className="font-semibold text-sm">{label}</p>{sublabel && <p className="text-xs text-[var(--color-muted)]">{sublabel}</p>}</div>
      {selected && <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#34D399] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>}
    </button>
  );
}

