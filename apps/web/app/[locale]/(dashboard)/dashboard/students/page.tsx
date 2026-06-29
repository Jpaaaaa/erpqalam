import { redirect } from '@/i18n/navigation';

export default function StudentsIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/students/pending', locale });
}
