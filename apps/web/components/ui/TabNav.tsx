'use client';

import { Link } from '@/i18n/navigation';

export type TabNavItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

interface TabNavProps {
  items: TabNavItem[];
  activeKey: string;
  className?: string;
  'aria-label'?: string;
}

export function TabNav({ items, activeKey, className = '', ...props }: TabNavProps) {
  const baseClass =
    'shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition min-h-[44px]';

  return (
    <nav
      className={`scrollbar-none flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible ${className}`}
      aria-label={props['aria-label']}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const activeClass = isActive
          ? 'bg-orange-100 text-orange-600 shadow-sm'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800';

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${baseClass} ${activeClass}`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`${baseClass} ${activeClass}`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
