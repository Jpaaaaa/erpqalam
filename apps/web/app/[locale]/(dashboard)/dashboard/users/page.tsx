import { getTranslations } from 'next-intl/server';
import { UsersPanel } from '@/components/users/UsersPanel';
import { PageCard } from '@/components/ui/PageCard';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('usersTitle') };
}

export default async function UsersPage() {
  return (
    <PageCard>
      <UsersPanel />
    </PageCard>
  );
}
