import { redirect } from '@/i18n/navigation';

export default function LegacyDocumentRequestsSettingsRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({
    href: '/dashboard/registration/document-requests/settings',
    locale,
  });
}
