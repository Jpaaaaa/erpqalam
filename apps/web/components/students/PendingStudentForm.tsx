'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { ApiClientError, createPendingStudent } from '@/lib/api/students';
import { formatStaffName } from '@/lib/students/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowNavForm } from '@/components/ui/ArrowNavForm';
import { CameViaWhatField } from '@/components/students/CameViaWhatField';
import { SectionField } from '@/components/students/SectionField';
import {
  buildCameViaValue,
  type CameViaSource,
} from '@/lib/students/came-via';
import type { PendingStudent } from '@/lib/types/student';
import type { SectionOption } from '@/lib/students/sections';

interface PendingStudentFormProps {
  onSubmitted?: (record: PendingStudent) => void;
}

function emptyForm() {
  return {
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    section: '' as SectionOption | '',
    phoneNumbers: ['', ''],
    guardianInfo: '',
    cameViaSource: '' as CameViaSource | '',
    cameViaFriendDetail: '',
  };
}

export function PendingStudentForm({ onSubmitted }: PendingStudentFormProps) {
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePhone(index: number, value: string) {
    setForm((prev) => {
      const phoneNumbers = [...prev.phoneNumbers];
      phoneNumbers[index] = value;
      return { ...prev, phoneNumbers };
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const phoneNumbers = form.phoneNumbers.map((p) => p.trim());
    if (phoneNumbers.some((p) => !p)) {
      setError(t('phoneNumbersRequired'));
      setIsLoading(false);
      return;
    }

    if (!form.section) {
      setError(t('sectionRequired'));
      setIsLoading(false);
      return;
    }

    if (!form.cameViaSource) {
      setError(t('cameViaRequired'));
      setIsLoading(false);
      return;
    }

    const comeViaWho = buildCameViaValue(
      form.cameViaSource,
      form.cameViaFriendDetail,
    );

    try {
      const created = await createPendingStudent({
        firstName: form.firstName,
        secondName: form.secondName,
        thirdName: form.thirdName,
        fourthName: form.fourthName,
        section: form.section,
        phoneNumbers,
        guardianInfo: form.guardianInfo || undefined,
        comeViaWho,
      });
      setSuccess(t('pendingFormSuccess'));
      setForm(emptyForm());
      onSubmitted?.(created);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('pendingFormError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const recorderName = user ? formatStaffName(user) : '';

  return (
    <ArrowNavForm onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {recorderName && (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {t('recordedByYou', { name: recorderName })}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-800">
          {t('fullName')}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            required
            value={form.thirdName}
            onChange={(e) => updateField('thirdName', e.target.value)}
          />
          <Input
            label={t('fourthName')}
            name="fourthName"
            required
            value={form.fourthName}
            onChange={(e) => updateField('fourthName', e.target.value)}
          />
        </div>
      </fieldset>

      <SectionField
        value={form.section}
        onChange={(section) => updateField('section', section)}
        required
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">
          {t('phoneNumbers')}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t('mobilePrimary')}
            name="phone-0"
            type="tel"
            required
            value={form.phoneNumbers[0]}
            onChange={(e) => updatePhone(0, e.target.value)}
          />
          <Input
            label={t('mobileSecondary')}
            name="phone-1"
            type="tel"
            required
            value={form.phoneNumbers[1]}
            onChange={(e) => updatePhone(1, e.target.value)}
          />
        </div>
      </fieldset>

      <CameViaWhatField
        source={form.cameViaSource}
        friendDetail={form.cameViaFriendDetail}
        onSourceChange={(source) => updateField('cameViaSource', source)}
        onFriendDetailChange={(detail) => updateField('cameViaFriendDetail', detail)}
        required
      />

      <div className="space-y-1.5">
        <label htmlFor="guardianInfo" className="block text-sm font-medium text-slate-700">
          {t('guardianInfo')}
        </label>
        <textarea
          id="guardianInfo"
          name="guardianInfo"
          rows={3}
          value={form.guardianInfo}
          onChange={(e) => updateField('guardianInfo', e.target.value)}
          placeholder={t('guardianInfoPlaceholder')}
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('addToPending')}
      </Button>
    </ArrowNavForm>
  );
}
