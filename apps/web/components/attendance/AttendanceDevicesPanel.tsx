'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  listAttendanceDevices,
  updateAttendanceDevice,
} from '@/lib/api/attendance';
import type { AttendanceDevice } from '@/lib/types/attendance';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AttendanceDevicesPanel() {
  const t = useTranslations('attendance.devices');
  const tCommon = useTranslations('common');
  const [devices, setDevices] = useState<AttendanceDevice[]>([]);
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingSerial, setSavingSerial] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await listAttendanceDevices();
      setDevices(rows);
      setDraftNames(
        Object.fromEntries(rows.map((d) => [d.serialNumber, d.name])),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDevice(serialNumber: string) {
    setSavingSerial(serialNumber);
    setError('');
    setSuccess('');
    try {
      const updated = await updateAttendanceDevice(serialNumber, {
        name: (draftNames[serialNumber] ?? '').trim(),
      });
      setDevices((prev) =>
        prev.map((d) => (d.serialNumber === serialNumber ? updated : d)),
      );
      setSuccess(t('saved'));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    } finally {
      setSavingSerial(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h3 className="mb-1 text-sm font-semibold text-slate-800">{t('title')}</h3>
      <p className="mb-4 text-sm text-slate-600">{t('description')}</p>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {devices.length === 0 ? (
        <p className="text-sm text-slate-500">{t('empty')}</p>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="grid gap-3 border-b border-slate-50 pb-4 last:border-0 last:pb-0 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('serialNumber')}
                </div>
                <div className="mt-1 font-mono text-sm text-slate-800">
                  {device.serialNumber}
                </div>
                {device.lastSeenAt && (
                  <div className="mt-1 text-xs text-slate-500">
                    {t('lastSeen')}: {device.lastSeenAt.replace('T', ' ').slice(0, 16)}
                  </div>
                )}
              </div>
              <Input
                label={t('displayName')}
                value={draftNames[device.serialNumber] ?? ''}
                onChange={(e) =>
                  setDraftNames((prev) => ({
                    ...prev,
                    [device.serialNumber]: e.target.value,
                  }))
                }
                placeholder={t('displayNamePlaceholder')}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={savingSerial === device.serialNumber}
                  onClick={() => saveDevice(device.serialNumber)}
                >
                  {t('save')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
