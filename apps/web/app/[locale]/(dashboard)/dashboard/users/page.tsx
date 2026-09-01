import { redirect } from '@/i18n/navigation';

export default function LegacyUsersRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/hr/users', locale });
}
