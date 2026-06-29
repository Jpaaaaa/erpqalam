import type { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

export function MobileCard({ children, className = '' }: MobileCardProps) {
  return (
    <article
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-card active:bg-slate-50/80 ${className}`}
    >
      {children}
    </article>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function DetailRow({ label, children, className = '' }: DetailRowProps) {
  return (
    <div className={`grid gap-0.5 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}
