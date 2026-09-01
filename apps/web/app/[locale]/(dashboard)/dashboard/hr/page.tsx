import { redirect } from '@/i18n/navigation';

export default function HrHomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/hr/attendance/overview', locale });
}
