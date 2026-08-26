import {
  API_BASE_URL,
  ApiClientError,
  apiRequest,
} from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/storage';
import type { ApiError } from '@/lib/types/auth';
import type {
  BackupSettings,
  DetectedTelegramChat,
  ReportKind,
  UpsertBackupSettingsPayload,
} from '@/lib/types/backup-settings';

export { ApiClientError };

export async function getBackupSettings(): Promise<BackupSettings> {
  return apiRequest<BackupSettings>('/backup-settings');
}

export async function saveBackupSettings(
  payload: UpsertBackupSettingsPayload,
): Promise<BackupSettings> {
  return apiRequest<BackupSettings>('/backup-settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function detectTelegramChats(
  botToken?: string,
): Promise<DetectedTelegramChat[]> {
  const data = await apiRequest<{ chats: DetectedTelegramChat[] }>(
    '/backup-settings/detect-chats',
    {
      method: 'POST',
      body: JSON.stringify(botToken?.trim() ? { botToken: botToken.trim() } : {}),
    },
  );
  return data.chats;
}

export async function sendBackupNow(): Promise<{
  ok: boolean;
  sent: number;
  failed: string[];
  message?: string;
}> {
  return apiRequest('/backup-settings/send-now', { method: 'POST' });
}

export async function sendActivityReportNow(kind: ReportKind): Promise<{
  ok: boolean;
  sent: number;
  failed: string[];
  fileName: string;
  message?: string;
}> {
  return apiRequest('/backup-settings/send-report-now', {
    method: 'POST',
    body: JSON.stringify({ kind }),
  });
}

export async function downloadBackupNow(): Promise<{
  blob: Blob;
  fileName: string;
}> {
  const headers: HeadersInit = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/backup-settings/run-now`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as ApiError;
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status);
  }

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const fileName = match?.[1] ?? `erpqalam-backup-${Date.now()}.zip`;
  const blob = await response.blob();
  return { blob, fileName };
}

export async function restoreBackup(file: File): Promise<{ ok: boolean; message?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirm', 'true');

  const headers: HeadersInit = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/backup-settings/restore`, {
    method: 'POST',
    headers,
    body: formData,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as ApiError;
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status);
  }

  return response.json() as Promise<{ ok: boolean; message?: string }>;
}
