import {
  apiFetch,
  apiRequest,
  ApiClientError,
  parseApiError,
} from '@/lib/api/client';
import type {
  CreateDocumentRequestPayload,
  DocumentRequestCreateDefaults,
  DocumentRequestSettings,
  PaginatedDocumentRequests,
  UpdateDocumentRequestSettingsPayload,
} from '@/lib/types/document-request';

export { ApiClientError };

export async function getDocumentRequestCreateDefaults(): Promise<DocumentRequestCreateDefaults> {
  return apiRequest<DocumentRequestCreateDefaults>('/document-requests/defaults');
}

export async function checkDocumentRequestNumber(
  documentNumber: string,
): Promise<{ exists: boolean }> {
  const search = new URLSearchParams({ documentNumber });
  return apiRequest<{ exists: boolean }>(
    `/document-requests/check-number?${search.toString()}`,
  );
}

export async function getDocumentRequestSettings(): Promise<DocumentRequestSettings> {
  return apiRequest<DocumentRequestSettings>('/document-requests/settings');
}

export async function updateDocumentRequestSettings(
  payload: UpdateDocumentRequestSettingsPayload,
): Promise<DocumentRequestSettings> {
  return apiRequest<DocumentRequestSettings>('/document-requests/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadDocumentRequestLetterheadTemplate(
  file: File,
): Promise<DocumentRequestSettings> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch('/document-requests/settings/template', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<DocumentRequestSettings>;
}

export async function fetchDocumentRequestLetterheadTemplate(): Promise<Blob> {
  const response = await apiFetch('/document-requests/settings/template', {
    method: 'GET',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.blob();
}

export async function deleteDocumentRequestLetterheadTemplate(): Promise<DocumentRequestSettings> {
  return apiRequest<DocumentRequestSettings>(
    '/document-requests/settings/template',
    { method: 'DELETE' },
  );
}

export async function listDocumentRequests(params?: {
  page?: number;
  limit?: number;
  studentId?: string;
  pendingStudentId?: string;
}): Promise<PaginatedDocumentRequests> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.studentId) search.set('studentId', params.studentId);
  if (params?.pendingStudentId) {
    search.set('pendingStudentId', params.pendingStudentId);
  }
  const query = search.toString();
  return apiRequest<PaginatedDocumentRequests>(
    `/document-requests${query ? `?${query}` : ''}`,
  );
}

async function fetchDocumentRequestPdfResponse(
  id: string,
): Promise<{ blob: Blob; documentNumber: string }> {
  const response = await apiFetch(`/document-requests/${id}/pdf`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const encodedNumber = response.headers.get('X-Document-Number');
  const documentNumber = encodedNumber
    ? decodeURIComponent(encodedNumber)
    : 'document';
  const blob = await response.blob();

  return { blob, documentNumber };
}

export async function fetchLatestDocumentRequestPdf(params: {
  studentId?: string;
  pendingStudentId?: string;
}): Promise<{ blob: Blob; documentNumber: string; documentId: string }> {
  const result = await listDocumentRequests({
    ...params,
    page: 1,
    limit: 1,
  });

  const latest = result.data[0];
  if (!latest) {
    throw new ApiClientError('No document request found for this student', 404);
  }

  const pdf = await fetchDocumentRequestPdfResponse(latest.id);
  return { ...pdf, documentId: latest.id };
}

export async function generateDocumentRequest(
  payload: CreateDocumentRequestPayload,
): Promise<{ documentNumber: string; documentId: string; blob: Blob }> {
  const response = await apiFetch('/document-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const encodedNumber = response.headers.get('X-Document-Number');
  const documentNumber = encodedNumber
    ? decodeURIComponent(encodedNumber)
    : 'document';
  const documentId = response.headers.get('X-Document-Id') ?? '';
  const blob = await response.blob();

  return { documentNumber, documentId, blob };
}

export function downloadDocumentRequestPdf(blob: Blob, documentNumber: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `document-request-${documentNumber}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function openDocumentRequestPdfInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');

  if (opened) {
    opened.opener = null;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
