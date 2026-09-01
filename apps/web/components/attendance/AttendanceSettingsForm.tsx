'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  getAttendanceSettings,
  updateAttendanceSettings,
} from '@/lib/api/attendance';
import type { AttendanceSettings } from '@/lib/types/attendance';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;

export function AttendanceSettingsForm() {
  const t = useTranslations('attendance.settings');
  const tCommon = useTranslations('common');
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAttendanceSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleWorkingDay(day: number) {
    if (!settings) return;
    const days = new Set(settings.workingDays);
    if (days.has(day)) days.delete(day);
    else days.add(day);
    setSettings({
      ...settings,
      workingDays: Array.from(days).sort((a, b) => a - b),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateAttendanceSettings(settings);
      setSettings(updated);
      setSuccess(t('saved'));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  if (!settings) {
    return error ? <Alert variant="error">{error}</Alert> : null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">{t('shiftSection')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('shiftStart')}
            type="time"
            value={settings.shiftStartTime}
            onChange={(e) =>
              setSettings({ ...settings, shiftStartTime: e.target.value })
            }
          />
          <Input
            label={t('shiftEnd')}
            type="time"
            value={settings.shiftEndTime}
            onChange={(e) =>
              setSettings({ ...settings, shiftEndTime: e.target.value })
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">{t('zonesSection')}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label={t('entryStart')} type="time" value={settings.entryZoneStart} onChange={(e) => setSettings({ ...settings, entryZoneStart: e.target.value })} />
          <Input label={t('entryEnd')} type="time" value={settings.entryZoneEnd} onChange={(e) => setSettings({ ...settings, entryZoneEnd: e.target.value })} />
          <Input label={t('lateStart')} type="time" value={settings.lateZoneStartTime} onChange={(e) => setSettings({ ...settings, lateZoneStartTime: e.target.value })} />
          <Input label={t('lateEnd')} type="time" value={settings.lateZoneEndTime} onChange={(e) => setSettings({ ...settings, lateZoneEndTime: e.target.value })} />
          <Input label={t('exitStart')} type="time" value={settings.exitZoneStart} onChange={(e) => setSettings({ ...settings, exitZoneStart: e.target.value })} />
          <Input label={t('exitEnd')} type="time" value={settings.exitZoneEnd} onChange={(e) => setSettings({ ...settings, exitZoneEnd: e.target.value })} />
          <Input label={t('earlyStart')} type="time" value={settings.earlyLeftZoneStartTime} onChange={(e) => setSettings({ ...settings, earlyLeftZoneStartTime: e.target.value })} />
          <Input label={t('earlyEnd')} type="time" value={settings.earlyLeftZoneEndTime} onChange={(e) => setSettings({ ...settings, earlyLeftZoneEndTime: e.target.value })} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">{t('workingDaysSection')}</h3>
        <div className="flex flex-wrap gap-2">
          {DAY_KEYS.map((key) => {
            const day = Number(key);
            const active = settings.workingDays.includes(day);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleWorkingDay(day)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t(`days.${key}`)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">{t('leaveSection')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('annualDays')}
            type="number"
            min={0}
            value={settings.annualHolidaysDays}
            onChange={(e) =>
              setSettings({
                ...settings,
                annualHolidaysDays: parseInt(e.target.value, 10) || 0,
              })
            }
          />
          <Input
            label={t('tempRatio')}
            type="number"
            min={1}
            value={settings.tempHolidaysPerFullHoliday}
            onChange={(e) =>
              setSettings({
                ...settings,
                tempHolidaysPerFullHoliday: parseInt(e.target.value, 10) || 1,
              })
            }
          />
        </div>
      </section>

      <Button type="submit" isLoading={saving} loadingLabel={tCommon('loading')}>
        {t('save')}
      </Button>
    </form>
  );
}
