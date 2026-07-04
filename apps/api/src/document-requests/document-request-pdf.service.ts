import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';

export interface DocumentRequestPdfInput {
  schoolName: string;
  previousSchoolName: string;
  documentNumber: string;
  documentDate: Date;
  studentFullName: string;
  academicYear: string;
  managerName: string;
}

const FONT_CANDIDATES = [
  join(__dirname, 'assets', 'fonts', 'Tajawal-Regular.ttf'),
  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),
  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),
  join(__dirname, 'assets', 'fonts', 'Amiri-Regular.ttf'),
  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Amiri-Regular.ttf'),
  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Amiri-Regular.ttf'),
];

const TEMPLATE_RELATIVE = join('public', 'template', 'Qalamform.pdf');

const TEMPLATE_CANDIDATES = [
  // Canva-exported letterhead at repo root (preferred).
  join(process.cwd(), '..', '..', TEMPLATE_RELATIVE),
  join(process.cwd(), TEMPLATE_RELATIVE),
  join(__dirname, '..', '..', '..', '..', TEMPLATE_RELATIVE),
  join(__dirname, '..', '..', '..', '..', '..', TEMPLATE_RELATIVE),
  // Bundled fallback.
  join(__dirname, 'assets', 'templates', 'institute-letterhead.pdf'),
  join(
    process.cwd(),
    'dist',
    'src',
    'document-requests',
    'assets',
    'templates',
    'institute-letterhead.pdf',
  ),
  join(
    process.cwd(),
    'src',
    'document-requests',
    'assets',
    'templates',
    'institute-letterhead.pdf',
  ),
];

const MARGIN = 72;
const BODY_SIZE = 13;
const HEADER_FIELD_SIZE = 11;
const LINE_GAP = 22;
const BODY_LINE_HEIGHT = 18;

const MANAGER_NAME = 'هاوسر عزيز عبدالقادر';

/** pdf-lib has no bidi — swap ASCII parens so they render correctly in RTL lines. */
function wrapStudentName(name: string): string {
  return `)${name}(`;
}

/** Mirror LTR runs (digits, hyphens) so they render correctly inside RTL body lines. */
function mirrorLtrRun(text: string): string {
  return text.split('').reverse().join('');
}

// Tajawal shapes Arabic via OpenType (fontkit). ArabicShaper presentation forms (U+FE…/U+FD…)
// are not in Tajawal’s glyph set and render as ▯ — use logical Arabic text instead.
// baselineFromTop = distance from page top to the text baseline (same as printed labels).
// Arabic العدد/التاريخ: right side — value sits to the left of the label (RTL).
// Kurdish ژماره/به‌روar: left side — value sits to the right of the label (LTR).
const HEADER_NUMBER = {
  arabic: {
    rightX: 170,
    baselineFromTop: 158,
  },
  kurdish: {
    x: 520,
    baselineFromTop: 158,
  },
};

const HEADER_DATE = {
  arabic: {
    rightX: 159,
    baselineFromTop: 180,
  },
  kurdish: {
    x: 500,
    baselineFromTop: 180,
  },
};

function resolveAssetPath(candidates: string[], label: string): string {
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`${label} not found for PDF generation`);
}

function formatArabicDate(date: Date): string {
  return date.toLocaleDateString('ar-IQ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Plain numeric date for header fields (avoids bidi issues with pdf-lib). */
function formatHeaderDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getAcademicYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function drawRtl(
  page: PDFPage,
  font: PDFFont,
  text: string,
  rightX: number,
  yFromTop: number,
  size: number,
): void {
  const pageHeight = page.getHeight();
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: rightX - textWidth,
    y: pageHeight - yFromTop,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawCentered(
  page: PDFPage,
  font: PDFFont,
  text: string,
  yFromTop: number,
  size: number,
): void {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: (pageWidth - textWidth) / 2,
    y: pageHeight - yFromTop,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawPlainAt(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  baselineFromTop: number,
  size: number,
): void {
  const pageHeight = page.getHeight();

  page.drawText(text, {
    x,
    y: pageHeight - baselineFromTop,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawPlainRtl(
  page: PDFPage,
  font: PDFFont,
  text: string,
  rightX: number,
  baselineFromTop: number,
  size: number,
): void {
  const pageHeight = page.getHeight();
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: rightX - textWidth,
    y: pageHeight - baselineFromTop,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawHeaderFields(
  page: PDFPage,
  font: PDFFont,
  documentNumber: string,
  documentDate: Date,
): void {
  const dateText = formatHeaderDate(documentDate);

  // Header values are short alphanumeric — skip Arabic reshaping so isolated
  // presentation forms do not end up invisible in the PDF.

  // Arabic العدد / التاريخ (right side)
  drawPlainRtl(
    page,
    font,
    documentNumber,
    HEADER_NUMBER.arabic.rightX,
    HEADER_NUMBER.arabic.baselineFromTop,
    HEADER_FIELD_SIZE,
  );
  drawPlainRtl(
    page,
    font,
    dateText,
    HEADER_DATE.arabic.rightX,
    HEADER_DATE.arabic.baselineFromTop,
    HEADER_FIELD_SIZE,
  );

  // Kurdish ژماره / به‌روar (left side)
  drawPlainAt(
    page,
    font,
    documentNumber,
    HEADER_NUMBER.kurdish.x,
    HEADER_NUMBER.kurdish.baselineFromTop,
    HEADER_FIELD_SIZE,
  );
  drawPlainAt(
    page,
    font,
    dateText,
    HEADER_DATE.kurdish.x,
    HEADER_DATE.kurdish.baselineFromTop,
    HEADER_FIELD_SIZE,
  );
}

function drawRtlBlock(
  page: PDFPage,
  font: PDFFont,
  text: string,
  leftX: number,
  rightX: number,
  yFromTop: number,
  size: number,
  lineHeight: number,
): number {
  const maxWidth = rightX - leftX;
  const lines = wrapText(text, font, size, maxWidth);
  let y = yFromTop;

  for (const line of lines) {
    drawRtl(page, font, line, rightX, y, size);
    y += lineHeight;
  }

  return y;
}

export async function buildDocumentRequestPdf(
  input: DocumentRequestPdfInput,
): Promise<Buffer> {
  const templateBytes = readFileSync(
    resolveAssetPath(TEMPLATE_CANDIDATES, 'Letterhead template'),
  );
  const fontBytes = readFileSync(resolveAssetPath(FONT_CANDIDATES, 'Tajawal font file'));

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.getPages()[0];
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const rightX = pageWidth - MARGIN;
  const leftX = MARGIN;

  drawHeaderFields(page, font, input.documentNumber, input.documentDate);

  let y = 210;

  const drawLine = (text: string, size = BODY_SIZE) => {
    drawRtl(page, font, text, rightX, y, size);
    y += LINE_GAP;
  };

  drawCentered(page, font, `إلى / ${input.previousSchoolName}`, y, BODY_SIZE);
  y += LINE_GAP;
  drawCentered(page, font, 'موضوع / طلب الوثيقة', y, BODY_SIZE);
  y += LINE_GAP;
  //drawLine(`التاريخ / ${formatArabicDate(input.documentDate)}`);

  y += 8;
  drawLine('تحية طيبة،');
  y += 4;

  const body = `نرجو منكم التفضل بالنظر في طلبنا بتزويدنا بالوثيقة المدرسية الأصلية للطالب/ة ${wrapStudentName(input.studentFullName)} للعام الدراسي ${mirrorLtrRun(input.academicYear)}.`;
  y = drawRtlBlock(page, font, body, leftX, rightX, y, BODY_SIZE, BODY_LINE_HEIGHT);

  y += 24;
  drawCentered(page, font, 'مع التقدير..', y, BODY_SIZE);
  y += LINE_GAP;

  const signatureFromTop = pageHeight - MARGIN - 52;
  drawPlainAt(page, font, 'مدير المعهد', leftX, signatureFromTop, BODY_SIZE);
  drawPlainAt(page, font, MANAGER_NAME, leftX, signatureFromTop + 16, BODY_SIZE);

  const footerY = pageHeight - MARGIN - 40;
  drawRtl(page, font, 'نخسة منه الى:', rightX, footerY, 12);
  drawRtl(page, font, '• الصادرة', rightX, footerY + 18, 12);

  return Buffer.from(await pdfDoc.save());
}
