import { redirect } from '@/i18n/navigation';

export default function LegacyDocumentRequestsRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect({ href: '/dashboard/registration/document-requests', locale });
}
