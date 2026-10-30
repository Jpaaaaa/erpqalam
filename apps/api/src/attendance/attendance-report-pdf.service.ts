import { Injectable, Logger } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import {
  buildReportHtml,
  type PdfBranding,
  type ReportHtmlFontAssets,
} from './pdf-templates/build-report-html';
import { AttendancePdfChromiumService } from './attendance-pdf-chromium.service';
import { AttendanceReportPdfFallbackService } from './attendance-report-pdf-fallback.service';
import type { EmployeeReportPdfPayload } from './attendance-report-pdf.types';
import { SchoolLogoStorage } from './school-logo.storage';

export type { EmployeeReportPdfPayload, EmployeeReportPdfRow } from './attendance-report-pdf.types';

@Injectable()
export class AttendanceReportPdfService {
  private readonly logger = new Logger(AttendanceReportPdfService.name);
  private fontCache: ReportHtmlFontAssets | null = null;
  private defaultLogoDataUri: string | null | undefined;

  constructor(
    private readonly chromium: AttendancePdfChromiumService,
    private readonly fallback: AttendanceReportPdfFallbackService,
    private readonly schoolLogos: SchoolLogoStorage,
  ) {}

  async resolveBranding(
    schoolId: string,
    schoolName: string,
  ): Promise<PdfBranding> {
    const uploaded = this.schoolLogos.readIfExists(schoolId);
    if (uploaded) {
      return {
        schoolName,
        logoDataUri: `data:${uploaded.mime};base64,${uploaded.base64}`,
      };
    }
    const defaultLogo = await this.loadDefaultLogoDataUri();
    return {
      schoolName,
      logoDataUri: defaultLogo,
    };
  }

  async render(
    payload: EmployeeReportPdfPayload,
    branding: PdfBranding,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const fileName = this.fallback.fileNameFor(payload);
    try {
      const fonts = await this.loadFonts();
      const html = buildReportHtml(payload, branding, fonts);
      const buffer = await this.chromium.renderPdf(html);
      return { buffer, fileName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Chromium HTML PDF failed (${payload.type}), using pdf-lib fallback: ${message}`,
      );
      return this.fallback.render(payload);
    }
  }

  private async loadFonts(): Promise<ReportHtmlFontAssets> {
    if (this.fontCache) {
      return this.fontCache;
    }
    const regularPath = this.resolveRequiredAssetPath(
      ['assets', 'fonts', 'Tajawal-Regular.ttf'],
      'Tajawal-Regular.ttf',
    );
    const boldPath = this.resolveOptionalAssetPath([
      'assets',
      'fonts',
      'Tajawal-Bold.ttf',
    ]);
    const regularBytes = await fs.readFile(regularPath);
    let boldBase64: string | null = null;
    if (boldPath) {
      boldBase64 = (await fs.readFile(boldPath)).toString('base64');
    }
    this.fontCache = {
      regularBase64: regularBytes.toString('base64'),
      boldBase64,
    };
    return this.fontCache;
  }

  private async loadDefaultLogoDataUri(): Promise<string | null> {
    if (this.defaultLogoDataUri !== undefined) {
      return this.defaultLogoDataUri;
    }
    const logoPath = this.resolveOptionalAssetPath(['assets', 'Qalamlogo.png']);
    if (!logoPath) {
      this.defaultLogoDataUri = null;
      return null;
    }
    const bytes = await fs.readFile(logoPath);
    this.defaultLogoDataUri = `data:image/png;base64,${bytes.toString('base64')}`;
    return this.defaultLogoDataUri;
  }

  private resolveRequiredAssetPath(segments: string[], label: string): string {
    const path = this.resolveOptionalAssetPath(segments);
    if (!path) {
      throw new Error(`Attendance PDF asset not found: ${label}`);
    }
    return path;
  }

  private resolveOptionalAssetPath(segments: string[]): string | null {
    const candidates = [
      join(process.cwd(), 'dist', 'src', 'attendance', ...segments),
      join(process.cwd(), 'src', 'attendance', ...segments),
      join(__dirname, ...segments),
    ];
    for (const path of candidates) {
      if (existsSync(path)) return path;
    }
    return null;
  }
}
