"use client";
export default function BookingSummaryCard({ items }: { items: { label: string; value: string; highlight?: boolean }[] }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-[var(--color-muted)]">{item.label}</span>
            <span className={`text-sm font-semibold ${item.highlight ? "text-[#34D399]" : "text-white"}`}>{item.value}</span>
          </div>
          {i < items.length - 1 && <div className="h-px bg-[var(--color-border)]" />}
        </div>
      ))}
    </div>
  );
}

