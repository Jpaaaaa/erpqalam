import { redirect } from '@/i18n/navigation';

export default function LegacyDocumentRequestsBackupRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/dashboard/registration/document-requests/backup',
    locale,
  });
}
