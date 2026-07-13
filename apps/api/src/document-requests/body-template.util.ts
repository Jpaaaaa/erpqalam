export interface BodyTemplateFields {
  introText: string;
  afterStudentText: string;
  instituteName: string;
  beforeYearText: string;
  closingText: string;
}

export const DEFAULT_BODY_TEMPLATE_FIELDS: BodyTemplateFields = {
  introText: 'نظراً للقبول الطالب/ـة',
  afterStudentText: 'في معهدنا',
  instituteName: 'معهد القلم الأهلي',
  beforeYearText: 'للعام الدراسي',
  closingText: 'يرجى تزويدنا بالوثيقة لآخر المرحلة الدراسية.',
};

const EMBEDDED_ACADEMIC_YEAR_PATTERN = /\s*\d{4}\s*[-/–]\s*\d{4}\s*/g;

/** Academic year is injected separately — strip duplicates from template text. */
export function stripEmbeddedAcademicYear(text: string): string {
  return text.replace(EMBEDDED_ACADEMIC_YEAR_PATTERN, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeFields(fields: BodyTemplateFields): BodyTemplateFields {
  return {
    introText: fields.introText.trim(),
    afterStudentText: fields.afterStudentText.trim(),
    instituteName: fields.instituteName.trim(),
    beforeYearText: stripEmbeddedAcademicYear(fields.beforeYearText),
    closingText: fields.closingText.trim(),
  };
}

export function composeBodyTemplate(fields: BodyTemplateFields): string {
  const normalized = normalizeFields(fields);
  return `${normalized.introText} {{studentName}} ${normalized.afterStudentText} ${normalized.instituteName} ${normalized.beforeYearText} {{academicYear}} ${normalized.closingText}`;
}

export const DEFAULT_BODY_TEMPLATE = composeBodyTemplate(
  DEFAULT_BODY_TEMPLATE_FIELDS,
);

const STORED_TEMPLATE_VERSION = 1;

type StoredBodyTemplate = BodyTemplateFields & { v: number };

export function serializeBodyTemplate(fields: BodyTemplateFields): string {
  const normalized = normalizeFields(fields);
  const payload: StoredBodyTemplate = { v: STORED_TEMPLATE_VERSION, ...normalized };
  return JSON.stringify(payload);
}

function isStoredBodyTemplate(value: unknown): value is StoredBodyTemplate {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.v === STORED_TEMPLATE_VERSION &&
    typeof record.introText === 'string' &&
    typeof record.afterStudentText === 'string' &&
    typeof record.instituteName === 'string' &&
    typeof record.beforeYearText === 'string' &&
    typeof record.closingText === 'string'
  );
}

function parseLegacyBodyTemplate(stored: string): BodyTemplateFields | null {
  const withInstitutePlaceholder =
    /^(.+?)\s*\{\{studentName\}\}\s*(.+?)\s*\{\{instituteName\}\}\s*(.+?)\s*\{\{academicYear\}\}\s*(.+)$/s;
  const withInstituteInParens =
    /^(.+?)\s*\{\{studentName\}\}\s*(.+?)\s*\((.+?)\)\s*(.+?)\s*\{\{academicYear\}\}\s*(.+)$/s;

  const placeholderMatch = stored.match(withInstitutePlaceholder);
  if (placeholderMatch) {
    return normalizeFields({
      introText: placeholderMatch[1],
      afterStudentText: placeholderMatch[2],
      instituteName: DEFAULT_BODY_TEMPLATE_FIELDS.instituteName,
      beforeYearText: placeholderMatch[3],
      closingText: placeholderMatch[4],
    });
  }

  const parensMatch = stored.match(withInstituteInParens);
  if (parensMatch) {
    return normalizeFields({
      introText: parensMatch[1],
      afterStudentText: parensMatch[2],
      instituteName: parensMatch[3],
      beforeYearText: parensMatch[4],
      closingText: parensMatch[5],
    });
  }

  return null;
}

export function parseBodyTemplateFields(
  stored: string | null | undefined,
): BodyTemplateFields {
  const trimmed = stored?.trim();
  if (!trimmed) {
    return { ...DEFAULT_BODY_TEMPLATE_FIELDS };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (isStoredBodyTemplate(parsed)) {
      return normalizeFields(parsed);
    }
  } catch {
    // fall through to legacy plain-text templates
  }

  const legacy = parseLegacyBodyTemplate(trimmed);
  if (legacy) {
    return legacy;
  }

  return { ...DEFAULT_BODY_TEMPLATE_FIELDS };
}

export function resolveBodyParagraph(
  stored: string | null | undefined,
): string {
  const fields = parseBodyTemplateFields(stored);
  return composeBodyTemplate(fields);
}
