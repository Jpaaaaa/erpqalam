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

  join(__dirname, 'assets', 'fonts', 'Tajawal-Regular.ttf'),

  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),

  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Tajawal-Regular.ttf'),

  join(__dirname, 'assets', 'fonts', 'Amiri-Regular.ttf'),

  join(process.cwd(), 'dist', 'src', 'document-requests', 'assets', 'fonts', 'Amiri-Regular.ttf'),

  join(process.cwd(), 'src', 'document-requests', 'assets', 'fonts', 'Amiri-Regular.ttf'),

];



const KURDISH_FONT_CANDIDATES = [

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



const ARABIC_MANAGER_NAME = 'هاوسر عزيز عبدالقادر';



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

): void {

  const dateText = formatHeaderDate(documentDate);



  if (language === 'ar') {

    drawCanvasTextRtl(

      ctx,

      documentNumber,

      HEADER_NUMBER.arabic.rightX,

      HEADER_NUMBER.arabic.baselineFromTop,

      HEADER_FIELD_SIZE,

    );

    drawCanvasTextRtl(

      ctx,

      dateText,

      HEADER_DATE.arabic.rightX,

      HEADER_DATE.arabic.baselineFromTop,

      HEADER_FIELD_SIZE,

    );

    return;

  }



  drawCanvasTextAt(

    ctx,

    documentNumber,

    HEADER_NUMBER.kurdish.x,

    HEADER_NUMBER.kurdish.baselineFromTop,

    HEADER_FIELD_SIZE,

    'ltr',

    'left',

  );

  drawCanvasTextAt(

    ctx,

    dateText,

    HEADER_DATE.kurdish.x,

    HEADER_DATE.kurdish.baselineFromTop,

    HEADER_FIELD_SIZE,

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
      ? resolveAssetPath(KURDISH_FONT_CANDIDATES, 'Rudaw font file')
      : resolveAssetPath(ARABIC_FONT_CANDIDATES, 'Arabic font file');

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



  drawHeaderFields(ctx, input.documentNumber, input.documentDate, input.language);



  let y = 210;



  drawVisualCentered(

    ctx,

    pageWidth,

    `${content.toPrefix} ${input.previousSchoolName}`,

    y,

    BODY_SIZE,

  );

  y += LINE_GAP;

  drawVisualCentered(ctx, pageWidth, content.subject, y, BODY_SIZE);

  y += LINE_GAP;

  drawVisualRtl(ctx, content.greeting, rightX, y, BODY_SIZE);

  y += LINE_GAP;



  y = drawBodyParagraph(

    ctx,

    bodyTemplate,

    input.studentFullName,

    input.academicYear,

    input.studentSectionLabel,

    leftX,

    rightX,

    y,

    BODY_SIZE,

    BODY_LINE_HEIGHT,

    input.language,

  );



  y += LINE_GAP;

  drawVisualCentered(ctx, pageWidth, content.closing, y, BODY_SIZE);



  const signatureFromTop = pageHeight - MARGIN - 68;

  drawCanvasTextLeft(ctx, content.directorTitle, leftX, signatureFromTop, BODY_SIZE);

  const titleWidth = measureCanvasTextWidth(
    ctx,
    content.directorTitle,
    BODY_SIZE,
    'rtl',
  );
  const titleCenterX = leftX + titleWidth / 2;

  drawCanvasTextAt(
    ctx,
    signatureName,
    titleCenterX,
    signatureFromTop + 16,
    BODY_SIZE,
    'rtl',
    'center',
  );



  if (content.footerCopyLine && content.footerBullet) {

    const footerY = pageHeight - MARGIN - 40;

    drawVisualRtl(ctx, content.footerCopyLine, rightX, footerY, 12);

    drawVisualRtl(ctx, content.footerBullet, rightX, footerY + 18, 12);

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

