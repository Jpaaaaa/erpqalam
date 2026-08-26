import { getTranslations } from 'next-intl/server';
import { DocumentRequestsPanel } from '@/components/document-requests/DocumentRequestsPanel';
import { PageCard } from '@/components/ui/PageCard';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('documentRequestsBackupTitle') };
}

export default async function DocumentRequestBackupPage() {
  return (
    <PageCard>
      <DocumentRequestsPanel />
    </PageCard>
  );
}
