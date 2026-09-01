import { getTranslations } from 'next-intl/server';
import { PermissionsPanel } from '@/components/settings/PermissionsPanel';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('permissionsTitle') };
}

export default async function PermissionsSettingsPage() {
  return <PermissionsPanel />;
}
