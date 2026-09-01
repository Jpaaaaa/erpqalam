import { redirect } from '@/i18n/navigation';

export default function LegacyStudentsRegisteredRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/registration/students/registered', locale });
}
