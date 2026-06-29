'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, createPendingStudentFull } from '@/lib/api/students';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface PendingStudentFormProps {
  onSubmitted?: () => void;
}

export function PendingStudentForm({ onSubmitted }: PendingStudentFormProps) {
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    mobilePrimary: '',
    mobileSecondary: '',
    comeViaWho: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await createPendingStudentFull({
        firstName: form.firstName,
        secondName: form.secondName,
        thirdName: form.thirdName || undefined,
        mobilePrimary: form.mobilePrimary,
        mobileSecondary: form.mobileSecondary || undefined,
        comeViaWho: form.comeViaWho,
      });
      setSuccess(t('pendingFormSuccess'));
      setForm({
        firstName: '',
        secondName: '',
        thirdName: '',
        mobilePrimary: '',
        mobileSecondary: '',
        comeViaWho: '',
      });
      onSubmitted?.();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('pendingFormError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="grid gap-5 sm:grid-cols-3">
        <Input
          label={t('firstName')}
          name="firstName"
          required
          value={form.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
        />
        <Input
          label={t('secondName')}
          name="secondName"
          required
          value={form.secondName}
          onChange={(e) => updateField('secondName', e.target.value)}
        />
        <Input
          label={t('thirdName')}
          name="thirdName"
          value={form.thirdName}
          onChange={(e) => updateField('thirdName', e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label={t('mobilePrimary')}
          name="mobilePrimary"
          type="tel"
          required
          value={form.mobilePrimary}
          onChange={(e) => updateField('mobilePrimary', e.target.value)}
        />
        <Input
          label={t('mobileSecondary')}
          name="mobileSecondary"
          type="tel"
          value={form.mobileSecondary}
          onChange={(e) => updateField('mobileSecondary', e.target.value)}
        />
      </div>

      <Input
        label={t('comeViaWho')}
        name="comeViaWho"
        required
        value={form.comeViaWho}
        onChange={(e) => updateField('comeViaWho', e.target.value)}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('addToPending')}
      </Button>
    </form>
  );
}
