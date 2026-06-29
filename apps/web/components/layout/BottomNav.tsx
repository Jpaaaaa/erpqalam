'use client';

import { Link } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';
import { useDashboardNavWithActive } from '@/lib/navigation/useDashboardNav';

interface BottomNavProps {
  user: AuthUser;
}

export function BottomNav({ user }: BottomNavProps) {
  const items = useDashboardNavWithActive(user);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[3.25rem] min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition active:scale-95 ${
                item.isActive
                  ? 'text-orange-500'
                  : 'text-slate-400 active:text-slate-600'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                  item.isActive ? 'bg-orange-100' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="max-w-full truncate text-[10px] font-semibold leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
