import { getTranslations } from 'next-intl/server';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('dashboardTitle') };
}

export default function DashboardPage() {
  return <RoleDashboard />;
}
