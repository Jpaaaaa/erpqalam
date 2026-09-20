import type { SKRSContext2D } from '@napi-rs/canvas';

import { existsSync, readFileSync } from 'fs';

import { join } from 'path';

import { PDFDocument } from 'pdf-lib';

import {

  getDocumentRequestStaticContent,

  KURDISH_MANAGER_NAME,

  resolveBodyTemplateForLanguage,

} from './document-request-content';

import type { DocumentRequestLanguage } from './document-request-language';

import {

  drawBodyParagraph,

  drawCanvasTextLeft,

  drawVisualCentered,

  drawVisualRtl,

} from './pdf-body-layout.util';

import {

  createTextSurface,

  drawCanvasTextAt,

  drawCanvasTextRtl,

  measureCanvasTextWidth,

  renderCanvasOverlay,

} from './pdf-canvas-text.util';



export { DEFAULT_BODY_TEMPLATE, DEFAULT_BODY_TEMPLATE_FIELDS } from './body-template.util';

export type { BodyTemplateFields } from './body-template.util';



export interface DocumentRequestPdfInput {

  schoolName: string;

  previousSchoolName: string;

  documentNumber: string;

  documentDate: Date;

  studentFullName: string;

  academicYear: string;

  studentSectionLabel: string;
  bodyTemplate: string;
  language: DocumentRequestLanguage;
  templateBytes?: Buffer;
}



const ARABIC_FONT_CANDIDATES = [

  join(__dirname, 'assets', 'fonts', 'Tajawal-Medium.ttf'),

  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Medium.ttf'),

  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Medium.ttf'),

  join(__dirname, 'assets', 'fonts', 'Tajawal-Regular.ttf'),

  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),

  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),

];



const RUDAW_FONT_CANDIDATES = [

  join(__dirname, 'assets', 'fonts', 'Rudaw-Regular.ttf'),

  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Rudaw-Regular.ttf'),

  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Rudaw-Regular.ttf'),

  join(process.cwd(), '..', 'web', 'app', 'fonts', 'rudaw-regular.ttf'),

];



const TEMPLATE_RELATIVE = join('public', 'template', 'Qalamform.pdf');



const TEMPLATE_CANDIDATES = [

  join(process.cwd(), '..', '..', TEMPLATE_RELATIVE),

  join(process.cwd(), TEMPLATE_RELATIVE),

  join(__dirname, '..', '..', '..', '..', TEMPLATE_RELATIVE),

  join(__dirname, '..', '..', '..', '..', '..', TEMPLATE_RELATIVE),

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

const FOOTER_SIZE = 12;



const ARABIC_BODY_SIZE = 14;

const ARABIC_HEADER_FIELD_SIZE = 12;

const ARABIC_LINE_GAP = 24;

const ARABIC_BODY_LINE_HEIGHT = 20;

const ARABIC_FOOTER_SIZE = 13;



const ARABIC_MANAGER_NAME = 'هاوسر عزيز عبدالقادر';



const HEADER_NUMBER = {

  arabic: {

    rightX: 165,

    baselineFromTop: 145,

  },

  kurdish: {

    x: 520,

    baselineFromTop: 145,

  },

};



const HEADER_DATE = {

  arabic: {

    rightX: 159,

    baselineFromTop: 169,

  },

  kurdish: {

    x: 490,

    baselineFromTop: 169,

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



function drawHeaderFields(

  ctx: SKRSContext2D,

  documentNumber: string,

  documentDate: Date,

  language: DocumentRequestLanguage,

  headerFieldSize: number,

): void {

  const dateText = formatHeaderDate(documentDate);



  if (language === 'ar') {

    drawCanvasTextRtl(

      ctx,

      documentNumber,

      HEADER_NUMBER.arabic.rightX,

      HEADER_NUMBER.arabic.baselineFromTop,

      headerFieldSize,

    );

    drawCanvasTextRtl(

      ctx,

      dateText,

      HEADER_DATE.arabic.rightX,

      HEADER_DATE.arabic.baselineFromTop,

      headerFieldSize,

    );

    return;

  }



  drawCanvasTextAt(

    ctx,

    documentNumber,

    HEADER_NUMBER.kurdish.x,

    HEADER_NUMBER.kurdish.baselineFromTop,

    headerFieldSize,

    'ltr',

    'left',

  );

  drawCanvasTextAt(

    ctx,

    dateText,

    HEADER_DATE.kurdish.x,

    HEADER_DATE.kurdish.baselineFromTop,

    headerFieldSize,

    'ltr',

    'left',

  );

}



export function loadDefaultLetterheadTemplateBytes(): Buffer {
  return readFileSync(
    resolveAssetPath(TEMPLATE_CANDIDATES, 'Letterhead template'),
  );
}

export async function buildDocumentRequestPdf(

  input: DocumentRequestPdfInput,

): Promise<Buffer> {

  const templateBytes =
    input.templateBytes ?? loadDefaultLetterheadTemplateBytes();

  const fontPath =
    input.language === 'ku'
      ? resolveAssetPath(RUDAW_FONT_CANDIDATES, 'Rudaw font file')
      : resolveAssetPath(ARABIC_FONT_CANDIDATES, 'Arabic font file');

  const bodySize =
    input.language === 'ar' ? ARABIC_BODY_SIZE : BODY_SIZE;

  const headerFieldSize =
    input.language === 'ar' ? ARABIC_HEADER_FIELD_SIZE : HEADER_FIELD_SIZE;

  const lineGap = input.language === 'ar' ? ARABIC_LINE_GAP : LINE_GAP;

  const bodyLineHeight =
    input.language === 'ar' ? ARABIC_BODY_LINE_HEIGHT : BODY_LINE_HEIGHT;

  const footerSize = input.language === 'ar' ? ARABIC_FOOTER_SIZE : FOOTER_SIZE;

  const content = getDocumentRequestStaticContent(input.language);

  const bodyTemplate = resolveBodyTemplateForLanguage(

    input.bodyTemplate,

    input.language,

  );

  const signatureName =

    input.language === 'ku' ? KURDISH_MANAGER_NAME : ARABIC_MANAGER_NAME;



  const pdfDoc = await PDFDocument.load(templateBytes);

  const page = pdfDoc.getPages()[0];

  const pageWidth = page.getWidth();

  const pageHeight = page.getHeight();

  const rightX = pageWidth - MARGIN;

  const leftX = MARGIN;



  const surface = createTextSurface(
    pageWidth,
    pageHeight,
    fontPath,
    input.language,
  );

  const { ctx } = surface;



  drawHeaderFields(
    ctx,
    input.documentNumber,
    input.documentDate,
    input.language,
    headerFieldSize,
  );



  let y = 210;



  drawVisualCentered(

    ctx,

    pageWidth,

    `${content.toPrefix} ${input.previousSchoolName}`,

    y,

    bodySize,

  );

  y += lineGap;

  drawVisualCentered(ctx, pageWidth, content.subject, y, bodySize);

  y += lineGap;

  drawVisualRtl(ctx, content.greeting, rightX, y, bodySize);

  y += lineGap;



  y = drawBodyParagraph(

    ctx,

    bodyTemplate,

    input.studentFullName,

    input.academicYear,

    input.studentSectionLabel,

    leftX,

    rightX,

    y,

    bodySize,

    bodyLineHeight,

    input.language,

  );



  y += lineGap;

  drawVisualCentered(ctx, pageWidth, content.closing, y, bodySize);



  const signatureFromTop = pageHeight - MARGIN - 68;

  drawCanvasTextLeft(ctx, content.directorTitle, leftX, signatureFromTop, bodySize);

  const titleWidth = measureCanvasTextWidth(
    ctx,
    content.directorTitle,
    bodySize,
    'rtl',
  );
  const titleCenterX = leftX + titleWidth / 2;

  drawCanvasTextAt(
    ctx,
    signatureName,
    titleCenterX,
    signatureFromTop + 16,
    bodySize,
    'rtl',
    'center',
  );



  if (content.footerCopyLine && content.footerBullet) {

    const footerY = pageHeight - MARGIN - 40;

    drawVisualRtl(ctx, content.footerCopyLine, rightX, footerY, footerSize);

    drawVisualRtl(ctx, content.footerBullet, rightX, footerY + 18, footerSize);

  }



  const overlayPng = renderCanvasOverlay(surface);

  const overlayImage = await pdfDoc.embedPng(overlayPng);

  page.drawImage(overlayImage, {

    x: 0,

    y: 0,

    width: pageWidth,

    height: pageHeight,

  });



  return Buffer.from(await pdfDoc.save());

}

