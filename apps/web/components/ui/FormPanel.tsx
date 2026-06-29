import type { ReactNode } from 'react';

type FormPanelTone = 'neutral' | 'brand' | 'warning';

interface FormPanelProps {
  title: string;
  children: ReactNode;
  tone?: FormPanelTone;
}

const toneClasses: Record<FormPanelTone, string> = {
  neutral: 'border-slate-200 bg-slate-50/80',
  brand: 'border-teal-100 bg-teal-50/40',
  warning: 'border-amber-200 bg-amber-50/50',
};

export function FormPanel({ title, children, tone = 'neutral' }: FormPanelProps) {
  return (
    <div className={`space-y-4 rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
