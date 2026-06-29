import type { UserStatus } from '@/lib/types/user';

const styles: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-orange-100 text-orange-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};

interface UserStatusBadgeProps {
  status: UserStatus;
  label: string;
}

export function UserStatusBadge({ status, label }: UserStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {label}
    </span>
  );
}
