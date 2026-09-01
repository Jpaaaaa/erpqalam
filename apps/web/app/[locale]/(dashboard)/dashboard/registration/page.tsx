import { redirect } from '@/i18n/navigation';

export default function RegistrationIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/registration/students/pending', locale });
}
