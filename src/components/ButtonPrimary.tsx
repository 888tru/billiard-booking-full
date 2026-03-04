"use client";
export default function ButtonPrimary({ children, onClick, disabled, loading, className = "" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`relative w-full py-4 rounded-2xl font-bold text-[15px] text-white bg-gradient-to-r from-[#4F8CFF] to-[#34D399] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(79,140,255,0.3)] ${className}`}>
      {loading ? <span className="flex items-center justify-center gap-2"><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Загрузка...</span> : children}
    </button>
  );
}

