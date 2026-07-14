'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LetterheadTemplateUpload } from '@/components/document-requests/LetterheadTemplateUpload';
import {
  ApiClientError,
  getDocumentRequestSettings,
  updateDocumentRequestSettings,
} from '@/lib/api/document-requests';
import {
  DEFAULT_BODY_PARAGRAPH_FIELDS,
  type BodyParagraphFields,
} from '@/lib/types/document-request';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function DocumentRequestSettingsForm() {
  const t = useTranslations('documentRequests.settings');
  const tCommon = useTranslations('common');
  const [prefix, setPrefix] = useState('ب');
  const [nextNumber, setNextNumber] = useState('1');
  const [bodyParagraph, setBodyParagraph] = useState<BodyParagraphFields>(
    DEFAULT_BODY_PARAGRAPH_FIELDS,
  );
  const [preview, setPreview] = useState('ب1');
  const [hasCustomLetterheadTemplate, setHasCustomLetterheadTemplate] =
    useState(false);
  const [letterheadTemplateFileName, setLetterheadTemplateFileName] = useState<
    string | null
  >(null);
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
      setBodyParagraph(settings.bodyParagraph);
      setPreview(settings.nextDocumentNumber);
      setHasCustomLetterheadTemplate(settings.hasCustomLetterheadTemplate);
      setLetterheadTemplateFileName(settings.letterheadTemplateFileName ?? null);
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

  function updateParagraphField<K extends keyof BodyParagraphFields>(
    key: K,
    value: BodyParagraphFields[K],
  ) {
    setBodyParagraph((current) => ({ ...current, [key]: value }));
  }

  function validateParagraph(fields: BodyParagraphFields): boolean {
    return Object.values(fields).every((value) => value.trim().length > 0);
  }

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

    const normalizedParagraph: BodyParagraphFields = {
      introText: bodyParagraph.introText.trim(),
      afterStudentText: bodyParagraph.afterStudentText.trim(),
      instituteName: bodyParagraph.instituteName.trim(),
      beforeYearText: bodyParagraph.beforeYearText.trim(),
      closingText: bodyParagraph.closingText.trim(),
    };

    if (!validateParagraph(normalizedParagraph)) {
      setError(t('invalidTemplate'));
      setSaving(false);
      return;
    }

    try {
      const settings = await updateDocumentRequestSettings({
        prefix: prefix.trim(),
        nextNumber: parsedNumber,
        bodyParagraph: normalizedParagraph,
      });
      setPrefix(settings.prefix);
      setNextNumber(String(settings.nextNumber));
      setBodyParagraph(settings.bodyParagraph);
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('numberingTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('description')}</p>
        </div>

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
      </section>

      <LetterheadTemplateUpload
        hasCustomTemplate={hasCustomLetterheadTemplate}
        templateFileName={letterheadTemplateFileName}
        onUpdated={load}
      />

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('templateTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('templateDescription')}</p>
        </div>

        <div className="space-y-4" dir="rtl">
          <Input
            label={t('introText')}
            name="introText"
            required
            value={bodyParagraph.introText}
            onChange={(e) => updateParagraphField('introText', e.target.value)}
          />

          <Input
            label={t('afterStudentText')}
            name="afterStudentText"
            required
            value={bodyParagraph.afterStudentText}
            onChange={(e) =>
              updateParagraphField('afterStudentText', e.target.value)
            }
          />

          <Input
            label={t('instituteName')}
            name="instituteName"
            required
            value={bodyParagraph.instituteName}
            onChange={(e) =>
              updateParagraphField('instituteName', e.target.value)
            }
          />

          <Input
            label={t('beforeYearText')}
            name="beforeYearText"
            required
            value={bodyParagraph.beforeYearText}
            onChange={(e) =>
              updateParagraphField('beforeYearText', e.target.value)
            }
          />

          <Input
            label={t('closingText')}
            name="closingText"
            required
            value={bodyParagraph.closingText}
            onChange={(e) => updateParagraphField('closingText', e.target.value)}
          />
        </div>
      </section>

      <Button type="submit" isLoading={saving} loadingLabel={tCommon('pleaseWait')}>
        {t('save')}
      </Button>
    </form>
  );
}
