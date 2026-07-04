'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  getDocumentRequestSettings,
  updateDocumentRequestSettings,
} from '@/lib/api/document-requests';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function DocumentRequestSettingsForm() {
  const t = useTranslations('documentRequests.settings');
  const tCommon = useTranslations('common');
  const [prefix, setPrefix] = useState('ب');
  const [nextNumber, setNextNumber] = useState('1');
  const [preview, setPreview] = useState('ب1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const settings = await getDocumentRequestSettings();
      setPrefix(settings.prefix);
      setNextNumber(String(settings.nextNumber));
      setPreview(settings.nextDocumentNumber);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loadError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const parsedNumber = Number.parseInt(nextNumber, 10);
    if (!Number.isFinite(parsedNumber) || parsedNumber < 1) {
      setError(t('invalidNumber'));
      setSaving(false);
      return;
    }

    try {
      const settings = await updateDocumentRequestSettings({
        prefix: prefix.trim(),
        nextNumber: parsedNumber,
      });
      setPrefix(settings.prefix);
      setNextNumber(String(settings.nextNumber));
      setPreview(settings.nextDocumentNumber);
      setSuccess(t('saveSuccess'));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <p className="text-sm text-slate-600">{t('description')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('prefix')}
          name="prefix"
          required
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />
        <Input
          label={t('nextNumber')}
          name="nextNumber"
          type="number"
          min={1}
          required
          value={nextNumber}
          onChange={(e) => setNextNumber(e.target.value)}
        />
      </div>

      <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
        {t('preview', { number: preview })}
      </div>

      <Button type="submit" isLoading={saving} loadingLabel={tCommon('pleaseWait')}>
        {t('save')}
      </Button>
    </form>
  );
}
