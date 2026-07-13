import type { SKRSContext2D } from '@napi-rs/canvas';
import {
  BodyTemplateFields,
  parseBodyTemplateFields,
} from './body-template.util';
import type { DocumentRequestLanguage } from './document-request-language';
import {
  drawCanvasParagraphRtl,
  drawCanvasTextAt,
  drawCanvasTextCentered,
  drawCanvasTextRtl,
} from './pdf-canvas-text.util';

function buildInstituteSegment(
  institute: string,
  department: string,
  language: DocumentRequestLanguage,
): string {
  if (institute && department) {
    return language === 'ku'
      ? `(${department} / ${institute})`
      : `(${institute}/ ${department})`;
  }

  if (institute) {
    return `(${institute})`;
  }

  if (department) {
    return `(${department})`;
  }

  return '';
}

export function buildBodySegments(
  fields: BodyTemplateFields,
  studentFullName: string,
  academicYear: string,
  studentSectionLabel: string,
  language: DocumentRequestLanguage = 'ar',
): string[] {
  const student = studentFullName.trim();
  const institute = fields.instituteName.trim();
  const department = studentSectionLabel.trim();
  const instituteSegment = buildInstituteSegment(institute, department, language);
  const year = academicYear.trim();
  const yearSegment =
    year && language === 'ku' ? `(${year})` : year;

  return [
    fields.introText,
    student ? `(${student})` : '',
    fields.afterStudentText,
    instituteSegment,
    fields.beforeYearText,
    yearSegment,
    fields.closingText,
  ].filter((segment) => segment.length > 0);
}

export function composeBodyParagraphText(
  fields: BodyTemplateFields,
  studentFullName: string,
  academicYear: string,
  studentSectionLabel: string,
  language: DocumentRequestLanguage = 'ar',
): string {
  return buildBodySegments(
    fields,
    studentFullName,
    academicYear,
    studentSectionLabel,
    language,
  ).join(' ');
}

export function drawVisualRtl(
  ctx: SKRSContext2D,
  text: string,
  rightX: number,
  yFromTop: number,
  size: number,
): void {
  drawCanvasTextRtl(ctx, text, rightX, yFromTop, size);
}

export function drawVisualCentered(
  ctx: SKRSContext2D,
  pageWidth: number,
  text: string,
  yFromTop: number,
  size: number,
): void {
  drawCanvasTextCentered(ctx, text, pageWidth, yFromTop, size);
}

export function drawBodyParagraph(
  ctx: SKRSContext2D,
  storedTemplate: string,
  studentFullName: string,
  academicYear: string,
  studentSectionLabel: string,
  leftX: number,
  rightX: number,
  yFromTop: number,
  size: number,
  lineHeight: number,
  language: DocumentRequestLanguage = 'ar',
): number {
  const fields = parseBodyTemplateFields(storedTemplate);
  const paragraph = composeBodyParagraphText(
    fields,
    studentFullName,
    academicYear,
    studentSectionLabel,
    language,
  );

  return drawCanvasParagraphRtl(
    ctx,
    paragraph,
    leftX,
    rightX,
    yFromTop,
    size,
    lineHeight,
  );
}

export function drawCanvasTextLeft(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  yFromTop: number,
  size: number,
): void {
  drawCanvasTextAt(ctx, text, x, yFromTop, size, 'rtl', 'left');
}
