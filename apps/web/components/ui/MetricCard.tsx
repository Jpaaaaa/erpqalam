import type { ReactNode } from 'react';

type MetricTone = 'teal' | 'orange' | 'coral' | 'amber';

interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: MetricTone;
  icon?: ReactNode;
  footer?: string;
  progress?: number;
}

const toneStyles: Record<
  MetricTone,
  { icon: string; bar: string; text: string }
> = {
  teal: {
    icon: 'bg-teal-100 text-teal-600',
    bar: 'bg-teal-400',
    text: 'text-teal-600',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-500',
    bar: 'bg-orange-400',
    text: 'text-orange-500',
  },
  coral: {
    icon: 'bg-red-100 text-red-500',
    bar: 'bg-red-400',
    text: 'text-red-500',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    bar: 'bg-amber-400',
    text: 'text-amber-600',
  },
};

export function MetricCard({
  label,
  value,
  tone = 'teal',
  icon,
  footer,
  progress,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
          >
            {icon}
          </div>
        )}
        <p className="ms-auto text-end text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${styles.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
      {footer && (
        <p className={`mt-2 text-xs font-medium ${styles.text}`}>{footer}</p>
      )}
    </div>
  );
}
