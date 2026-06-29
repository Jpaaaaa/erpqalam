'use client';

import { useAuth } from '@/lib/auth/context';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        {user && <Sidebar user={user} />}
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
