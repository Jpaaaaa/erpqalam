import { redirect } from '@/i18n/navigation';

export default function LegacyStudentsRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/registration/students/pending', locale });
}
