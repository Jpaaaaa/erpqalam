import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('usersTitle') };
}

export default async function UsersPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{t('usersTitle')}</h2>
      <p className="mt-2 text-sm text-slate-600">{t('usersDescription')}</p>
    </div>
  );
}
