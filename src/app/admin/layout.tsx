"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSSE } from "@/hooks/useSSE";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: "📊" },
  { href: "/admin/bookings", label: "Брони", icon: "📋" },
  { href: "/admin/tables", label: "Столы", icon: "🎱" },
  { href: "/admin/settings", label: "Настройки", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useSSE();
  const path = usePathname();
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-black text-base tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F8CFF] to-[#34D399] flex items-center justify-center text-sm">🎱</span>
            <span className="hidden sm:inline">ADMIN PANEL</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(n => {
              const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${active ? "bg-[#4F8CFF]/15 text-[#4F8CFF]" : "text-[var(--color-muted)] hover:text-white"}`}>
                  <span>{n.icon}</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] flex z-50">
        {NAV.map(n => {
          const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`flex-1 flex flex-col items-center py-2 text-[10px] font-semibold transition-colors ${active ? "text-[#4F8CFF]" : "text-[var(--color-muted)]"}`}>
              <span className="text-lg mb-0.5">{n.icon}</span>{n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

