'use client';

import { useAuth } from '@/lib/auth/context';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-dvh pb-bottom-nav md:pb-0">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="mx-auto flex max-w-[1600px] gap-4 md:gap-5">
            {user && <Sidebar user={user} />}
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 md:gap-5">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>
        {user && <BottomNav user={user} />}
      </div>
    </AuthGuard>
  );
}
