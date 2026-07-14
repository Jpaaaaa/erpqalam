import {
  createCanvas,
  type Canvas,
  type SKRSContext2D,
  GlobalFonts,
} from '@napi-rs/canvas';
import type { DocumentRequestLanguage } from './document-request-language';

const ARABIC_FONT_FAMILY = 'Tajawal';
const KURDISH_FONT_FAMILY = 'Rudaw';

const registeredFonts = new Set<string>();
const ctxFontFamilies = new WeakMap<SKRSContext2D, string>();

export interface CanvasTextSurface {
  canvas: Canvas;
  ctx: SKRSContext2D;
  width: number;
  height: number;
  scale: number;
  language: DocumentRequestLanguage;
}

function resolveFontFamily(language: DocumentRequestLanguage): string {
  return language === 'ku' ? KURDISH_FONT_FAMILY : ARABIC_FONT_FAMILY;
}

export function registerCanvasFont(
  fontPath: string,
  family: string,
): void {
  const key = `${family}:${fontPath}`;
  if (registeredFonts.has(key)) {
    return;
  }

  GlobalFonts.registerFromPath(fontPath, family);
  registeredFonts.add(key);
}

export function createTextSurface(
  width: number,
  height: number,
  fontPath: string,
  language: DocumentRequestLanguage,
  scale = 2,
): CanvasTextSurface {
  const fontFamily = resolveFontFamily(language);
  registerCanvasFont(fontPath, fontFamily);

  const canvas = createCanvas(Math.round(width * scale), Math.round(height * scale));
  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, width, height);
  ctxFontFamilies.set(ctx, fontFamily);

  return { canvas, ctx, width, height, scale, language };
}

function setFont(ctx: SKRSContext2D, size: number): void {
  const family = ctxFontFamilies.get(ctx) ?? ARABIC_FONT_FAMILY;
  ctx.font = `${size}px ${family}`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';
}

export function measureCanvasTextWidth(
  ctx: SKRSContext2D,
  text: string,
  size: number,
  direction: 'rtl' | 'ltr' = 'rtl',
): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  setFont(ctx, size);
  ctx.direction = direction;
  return ctx.measureText(trimmed).width;
}

export function drawCanvasTextRtl(
  ctx: SKRSContext2D,
  text: string,
  rightX: number,
  yFromTop: number,
  size: number,
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  setFont(ctx, size);
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillText(trimmed, rightX, yFromTop);
}

export function drawCanvasTextCentered(
  ctx: SKRSContext2D,
  text: string,
  pageWidth: number,
  yFromTop: number,
  size: number,
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  setFont(ctx, size);
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillText(trimmed, pageWidth / 2, yFromTop);
}

export function drawCanvasTextAt(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  yFromTop: number,
  size: number,
  direction: 'rtl' | 'ltr' = 'rtl',
  align: 'left' | 'right' | 'start' | 'center' = 'left',
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  setFont(ctx, size);
  ctx.direction = direction;
  ctx.textAlign = align;
  ctx.fillText(trimmed, x, yFromTop);
}

function wrapCanvasLines(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  size: number,
  direction: 'rtl' | 'ltr' = 'rtl',
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let currentWords: string[] = [];

  for (const word of words) {
    const candidate = [...currentWords, word].join(' ');
    const candidateWidth = measureCanvasTextWidth(ctx, candidate, size, direction);

    if (currentWords.length > 0 && candidateWidth > maxWidth) {
      lines.push(currentWords.join(' '));
      currentWords = [word];
      continue;
    }

    currentWords.push(word);
  }

  if (currentWords.length > 0) {
    lines.push(currentWords.join(' '));
  }

  return lines;
}

export function drawCanvasParagraphRtl(
  ctx: SKRSContext2D,
  text: string,
  leftX: number,
  rightX: number,
  yFromTop: number,
  size: number,
  lineHeight: number,
): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return yFromTop;
  }

  const lines = wrapCanvasLines(ctx, trimmed, rightX - leftX, size, 'rtl');
  let y = yFromTop;

  for (const line of lines) {
    drawCanvasTextRtl(ctx, line, rightX, y, size);
    y += lineHeight;
  }

  return y;
}

export function renderCanvasOverlay(surface: CanvasTextSurface): Buffer {
  return surface.canvas.toBuffer('image/png');
}
