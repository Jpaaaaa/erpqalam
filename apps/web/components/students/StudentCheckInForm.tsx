'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, submitStudentCheckIn } from '@/lib/api/students';
import { buildCameViaValue, type CameViaSource } from '@/lib/students/came-via';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowNavForm } from '@/components/ui/ArrowNavForm';
import { CameViaWhatField } from '@/components/students/CameViaWhatField';

function emptyForm() {
  return {
    firstName: '',
    secondName: '',
    cameViaSource: '' as CameViaSource | '',
    cameViaFriendDetail: '',
    schoolCode: 'QALAM001',
  };
}

export function StudentCheckInForm() {
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const [form, setForm] = useState(emptyForm);
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

    let comeViaWho: string | undefined;

    if (form.cameViaSource) {
      comeViaWho = buildCameViaValue(form.cameViaSource, form.cameViaFriendDetail);
    }

    try {
      await submitStudentCheckIn({
        firstName: form.firstName,
        secondName: form.secondName,
        schoolCode: form.schoolCode,
        comeViaWho,
      });
      setSuccess(t('checkInSuccess'));
      setForm(emptyForm());
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('checkInError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ArrowNavForm onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label={t('firstName')}
          name="firstName"
          required
          autoComplete="given-name"
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
      </div>

      <CameViaWhatField
        source={form.cameViaSource}
        friendDetail={form.cameViaFriendDetail}
        onSourceChange={(source) => updateField('cameViaSource', source)}
        onFriendDetailChange={(detail) => updateField('cameViaFriendDetail', detail)}
      />

      <Input
        label={t('schoolCode')}
        name="schoolCode"
        required
        value={form.schoolCode}
        onChange={(e) => updateField('schoolCode', e.target.value)}
        placeholder="QALAM001"
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('submitName')}
      </Button>
    </ArrowNavForm>
  );
}
