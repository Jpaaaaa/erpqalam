'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowNavForm } from '@/components/ui/ArrowNavForm';

export function RegisterForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    schoolCode: 'QALAM001',
    phone: '',
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
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        schoolCode: form.schoolCode,
        phone: form.phone || undefined,
      });
      setSuccess(t('registerSuccess'));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('registerError');
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
          value={form.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
        />
        <Input
          label={t('lastName')}
          name="lastName"
          required
          value={form.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
        />
      </div>

      <Input
        label={t('email')}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <Input
        label={t('password')}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
      />

      <Input
        label={t('schoolCode')}
        name="schoolCode"
        required
        value={form.schoolCode}
        onChange={(e) => updateField('schoolCode', e.target.value)}
        placeholder="QALAM001"
      />

      <Input
        label={t('phoneOptional')}
        name="phone"
        type="tel"
        value={form.phone}
        onChange={(e) => updateField('phone', e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('registerAsEmployee')}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500">
          {t('signIn')}
        </Link>
      </p>
    </ArrowNavForm>
  );
}
