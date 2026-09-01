import { redirect } from '@/i18n/navigation';

export default function AttendanceIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/hr/attendance/overview', locale });
}
