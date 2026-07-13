export const DOCUMENT_REQUEST_LANGUAGES = ['ar', 'ku'] as const;

export type DocumentRequestLanguage = (typeof DOCUMENT_REQUEST_LANGUAGES)[number];

export function isDocumentRequestLanguage(
  value: string,
): value is DocumentRequestLanguage {
  return (DOCUMENT_REQUEST_LANGUAGES as readonly string[]).includes(value);
}

export function normalizeDocumentRequestLanguage(
  value: string | undefined | null,
): DocumentRequestLanguage {
  const trimmed = value?.trim();
  if (trimmed && isDocumentRequestLanguage(trimmed)) {
    return trimmed;
  }
  return 'ar';
}
