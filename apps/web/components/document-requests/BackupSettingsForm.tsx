'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  detectTelegramChats,
  downloadBackupNow,
  getBackupSettings,
  restoreBackup,
  saveBackupSettings,
  sendActivityReportNow,
  sendBackupNow,
} from '@/lib/api/backup-settings';
import type { ReportKind } from '@/lib/types/backup-settings';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

export function BackupSettingsForm() {
  const t = useTranslations('documentRequests.backup');
  const tCommon = useTranslations('common');

  const [botToken, setBotToken] = useState('');
  const [chatIds, setChatIds] = useState<string[]>(['']);
  const [backupTime, setBackupTime] = useState('20:00');
  const [dailyReportEnabled, setDailyReportEnabled] = useState(true);
  const [dailyReportTime, setDailyReportTime] = useState('20:00');
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(true);
  const [weeklyReportDay, setWeeklyReportDay] = useState(6);
  const [weeklyReportTime, setWeeklyReportTime] = useState('20:00');
  const [monthlyReportEnabled, setMonthlyReportEnabled] = useState(true);
  const [monthlyReportDay, setMonthlyReportDay] = useState(1);
  const [monthlyReportTime, setMonthlyReportTime] = useState('20:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingReport, setSendingReport] = useState<ReportKind | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const applySettings = useCallback(
    (settings: Awaited<ReturnType<typeof getBackupSettings>>) => {
      setBotToken(settings.botToken);
      setChatIds(settings.chatIds.length > 0 ? settings.chatIds : ['']);
      setBackupTime(settings.backupTime || '20:00');
      setDailyReportEnabled(settings.dailyReportEnabled);
      setDailyReportTime(settings.dailyReportTime || '20:00');
      setWeeklyReportEnabled(settings.weeklyReportEnabled);
      setWeeklyReportDay(settings.weeklyReportDay);
      setWeeklyReportTime(settings.weeklyReportTime || '20:00');
      setMonthlyReportEnabled(settings.monthlyReportEnabled);
      setMonthlyReportDay(settings.monthlyReportDay);
      setMonthlyReportTime(settings.monthlyReportTime || '20:00');
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const settings = await getBackupSettings();
      applySettings(settings);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loadError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applySettings, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateChatId(index: number, value: string) {
    setChatIds((current) =>
      current.map((id, i) => (i === index ? value : id)),
    );
  }

  function addChatId() {
    setChatIds((current) => [...current, '']);
  }

  function removeChatId(index: number) {
    setChatIds((current) => {
      if (current.length <= 1) return [''];
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleDetectChats() {
    setError('');
    setSuccess('');

    if (!botToken.trim()) {
      setError(t('detectNeedToken'));
      return;
    }

    setDetecting(true);
    try {
      const chats = await detectTelegramChats(botToken);
      if (chats.length === 0) {
        setError(t('detectEmpty'));
        return;
      }

      setChatIds(chats.map((chat) => chat.chatId));
      setSuccess(t('detectSuccess', { count: chats.length }));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('detectError');
      setError(message);
    } finally {
      setDetecting(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const times = [backupTime, dailyReportTime, weeklyReportTime, monthlyReportTime];
    if (times.some((value) => !/^\d{2}:\d{2}$/.test(value))) {
      setError(t('invalidTime'));
      setSaving(false);
      return;
    }

    try {
      const settings = await saveBackupSettings({
        botToken: botToken.trim(),
        chatIds: chatIds.map((id) => id.trim()).filter(Boolean),
        backupTime,
        dailyReportEnabled,
        dailyReportTime,
        weeklyReportEnabled,
        weeklyReportDay,
        weeklyReportTime,
        monthlyReportEnabled,
        monthlyReportDay,
        monthlyReportTime,
      });
      applySettings(settings);
      setSuccess(t('saveSuccess'));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadNow() {
    setError('');
    setSuccess('');
    setDownloading(true);
    try {
      const { blob, fileName } = await downloadBackupNow();
      triggerBlobDownload(blob, fileName);
      setSuccess(t('downloadSuccess'));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('downloadError');
      setError(message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleSendNow() {
    setError('');
    setSuccess('');
    setSending(true);
    try {
      const result = await sendBackupNow();
      setSuccess(result.message ?? t('sendSuccess', { count: result.sent }));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('sendError');
      setError(message);
    } finally {
      setSending(false);
    }
  }

  async function handleSendReport(kind: ReportKind) {
    setError('');
    setSuccess('');
    setSendingReport(kind);
    try {
      const result = await sendActivityReportNow(kind);
      setSuccess(result.message ?? t('reportSendSuccess', { kind }));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('reportSendError');
      setError(message);
    } finally {
      setSendingReport(null);
    }
  }

  async function handleRestore() {
    setError('');
    setSuccess('');

    if (!restoreFile) {
      setError(t('restoreNoFile'));
      return;
    }

    const confirmed = window.confirm(t('restoreConfirm'));
    if (!confirmed) return;

    setRestoring(true);
    try {
      await restoreBackup(restoreFile);
      setSuccess(t('restoreSuccess'));
      setRestoreFile(null);
      setFileInputKey((key) => key + 1);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('restoreError');
      setError(message);
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {t('telegramTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{t('description')}</p>
          </div>

          <Input
            label={t('botToken')}
            name="botToken"
            type="password"
            autoComplete="off"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456:ABC-DEF..."
          />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">
                {t('chatIds')}
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={detecting}
                  loadingLabel={tCommon('pleaseWait')}
                  onClick={() => void handleDetectChats()}
                >
                  {t('detectChats')}
                </Button>
                <Button type="button" variant="secondary" onClick={addChatId}>
                  {t('addChatId')}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">{t('detectHint')}</p>

            {chatIds.map((chatId, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={t('chatIdLabel', { n: index + 1 })}
                    name={`chatId-${index}`}
                    value={chatId}
                    onChange={(e) => updateChatId(index, e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeChatId(index)}
                  disabled={chatIds.length <= 1 && !chatId}
                >
                  {t('removeChatId')}
                </Button>
              </div>
            ))}
          </div>

          <Input
            label={t('backupTime')}
            name="backupTime"
            type="time"
            required
            value={backupTime}
            onChange={(e) => setBackupTime(e.target.value)}
          />
        </section>

        <section className="space-y-5 border-t border-slate-200 pt-8">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {t('reportsTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{t('reportsDescription')}</p>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              checked={dailyReportEnabled}
              onChange={(e) => setDailyReportEnabled(e.target.checked)}
            />
            {t('dailyReportEnabled')}
          </label>
          <Input
            label={t('dailyReportTime')}
            name="dailyReportTime"
            type="time"
            value={dailyReportTime}
            onChange={(e) => setDailyReportTime(e.target.value)}
            disabled={!dailyReportEnabled}
          />

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              checked={weeklyReportEnabled}
              onChange={(e) => setWeeklyReportEnabled(e.target.checked)}
            />
            {t('weeklyReportEnabled')}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="weeklyReportDay"
                className="block text-sm font-medium text-slate-700"
              >
                {t('weeklyReportDay')}
              </label>
              <select
                id="weeklyReportDay"
                name="weeklyReportDay"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:py-2.5 sm:text-sm disabled:opacity-60"
                value={weeklyReportDay}
                disabled={!weeklyReportEnabled}
                onChange={(e) => setWeeklyReportDay(Number(e.target.value))}
              >
                {WEEKDAY_VALUES.map((day) => (
                  <option key={day} value={day}>
                    {t(`weekday.${day}`)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('weeklyReportTime')}
              name="weeklyReportTime"
              type="time"
              value={weeklyReportTime}
              onChange={(e) => setWeeklyReportTime(e.target.value)}
              disabled={!weeklyReportEnabled}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              checked={monthlyReportEnabled}
              onChange={(e) => setMonthlyReportEnabled(e.target.checked)}
            />
            {t('monthlyReportEnabled')}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('monthlyReportDay')}
              name="monthlyReportDay"
              type="number"
              min={1}
              max={28}
              value={String(monthlyReportDay)}
              onChange={(e) =>
                setMonthlyReportDay(
                  Math.min(28, Math.max(1, Number(e.target.value) || 1)),
                )
              }
              disabled={!monthlyReportEnabled}
            />
            <Input
              label={t('monthlyReportTime')}
              name="monthlyReportTime"
              type="time"
              value={monthlyReportTime}
              onChange={(e) => setMonthlyReportTime(e.target.value)}
              disabled={!monthlyReportEnabled}
            />
          </div>
          <p className="text-xs text-slate-500">{t('monthlyReportHint')}</p>
        </section>

        <Button type="submit" isLoading={saving} loadingLabel={tCommon('pleaseWait')}>
          {t('save')}
        </Button>
      </form>

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('actionsTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('actionsDescription')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            isLoading={sending}
            loadingLabel={tCommon('pleaseWait')}
            onClick={() => void handleSendNow()}
          >
            {t('sendNow')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            isLoading={downloading}
            loadingLabel={tCommon('pleaseWait')}
            onClick={() => void handleDownloadNow()}
          >
            {t('downloadNow')}
          </Button>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('reportActionsTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('reportActionsDescription')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(['daily', 'weekly', 'monthly'] as ReportKind[]).map((kind) => (
            <Button
              key={kind}
              type="button"
              variant="secondary"
              isLoading={sendingReport === kind}
              loadingLabel={tCommon('pleaseWait')}
              disabled={sendingReport !== null}
              onClick={() => void handleSendReport(kind)}
            >
              {t(`sendReport.${kind}`)}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('restoreTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('restoreDescription')}</p>
        </div>

        <Input
          key={fileInputKey}
          label={t('restoreFile')}
          name="restoreFile"
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
        />

        <Button
          type="button"
          variant="secondary"
          isLoading={restoring}
          loadingLabel={tCommon('pleaseWait')}
          onClick={() => void handleRestore()}
        >
          {t('restore')}
        </Button>
      </section>
    </div>
  );
}
