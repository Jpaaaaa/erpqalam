import { Injectable, Logger } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import * as fontkit from '@pdf-lib/fontkit';
import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib';
import { PrismaService } from '../database/prisma.service';
import { BackupService } from './backup.service';

export type ReportKind = 'daily' | 'weekly' | 'monthly';

export type ReportPeriod = {
  kind: ReportKind;
  label: string;
  start: Date;
  end: Date;
};

type StudentReportRow = {
  name: string;
  section: string;
  phones: string;
  stage: string;
  guardian: string;
  date: string;
};

type DocumentReportRow = {
  documentNumber: string;
  studentName: string;
  previousSchool: string;
  academicYear: string;
  date: string;
};

type TableColumn = {
  key: string;
  label: string;
  width: number;
};

const COLORS = {
  brand: rgb(0.05, 0.42, 0.42),
  brandSoft: rgb(0.9, 0.96, 0.95),
  ink: rgb(0.12, 0.14, 0.18),
  muted: rgb(0.4, 0.45, 0.5),
  line: rgb(0.82, 0.86, 0.88),
  headerBg: rgb(0.05, 0.42, 0.42),
  headerText: rgb(1, 1, 1),
  rowAlt: rgb(0.96, 0.98, 0.98),
  accent: rgb(0.95, 0.45, 0.2),
};

@Injectable()
export class BackupReportService {
  private readonly logger = new Logger(BackupReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly backupService: BackupService,
  ) {}

  resolvePeriod(
    kind: ReportKind,
    now = new Date(),
    mode: 'scheduled' | 'partial' = 'scheduled',
  ): ReportPeriod {
    if (mode === 'partial') {
      return this.resolvePartialPeriod(kind, now);
    }
    return this.resolveScheduledPeriod(kind, now);
  }

  private resolvePartialPeriod(kind: ReportKind, now: Date): ReportPeriod {
    const end = new Date(now);

    if (kind === 'daily') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return {
        kind,
        label: `${this.formatDate(start)} (00:00 → now)`,
        start,
        end,
      };
    }

    if (kind === 'weekly') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay());
      return {
        kind,
        label: `${this.formatDate(start)} → ${this.formatDate(now)} (partial week)`,
        start,
        end,
      };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      kind,
      label: `${this.formatDate(start)} → ${this.formatDate(now)} (partial month)`,
      start,
      end,
    };
  }

  private resolveScheduledPeriod(kind: ReportKind, now: Date): ReportPeriod {
    if (kind === 'daily') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const dayEnd = new Date(start);
      dayEnd.setDate(dayEnd.getDate() + 1);
      return {
        kind,
        label: this.formatDate(start),
        start,
        end: dayEnd,
      };
    }

    if (kind === 'weekly') {
      const dayEnd = new Date(now);
      dayEnd.setHours(0, 0, 0, 0);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const start = new Date(dayEnd);
      start.setDate(start.getDate() - 7);
      return {
        kind,
        label: `${this.formatDate(start)} → ${this.formatDate(new Date(dayEnd.getTime() - 1))}`,
        start,
        end: dayEnd,
      };
    }

    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      kind,
      label: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      start,
      end: firstOfThisMonth,
    };
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private formatDateTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${this.formatDate(d)} ${hh}:${mm}`;
  }

  private fullName(parts: Array<string | null | undefined>): string {
    return parts.filter(Boolean).join(' ').trim() || '—';
  }

  private formatPhones(phones: string[]): string {
    return phones.filter(Boolean).join(' / ') || '—';
  }

  async buildPdf(
    period: ReportPeriod,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const [pending, registered, letters] = await Promise.all([
      this.prisma.pendingStudent.findMany({
        where: { createdAt: { gte: period.start, lt: period.end } },
        orderBy: { createdAt: 'asc' },
        select: {
          firstName: true,
          secondName: true,
          thirdName: true,
          fourthName: true,
          section: true,
          phoneNumbers: true,
          stage: true,
          guardianName: true,
          guardianInfo: true,
          createdAt: true,
        },
      }),
      this.prisma.student.findMany({
        where: { registeredAt: { gte: period.start, lt: period.end } },
        orderBy: { registeredAt: 'asc' },
        select: {
          firstName: true,
          secondName: true,
          thirdName: true,
          fourthName: true,
          section: true,
          phoneNumbers: true,
          stage: true,
          guardianName: true,
          guardianInfo: true,
          registeredAt: true,
        },
      }),
      this.prisma.documentRequestLetter.findMany({
        where: { createdAt: { gte: period.start, lt: period.end } },
        orderBy: { createdAt: 'asc' },
        select: {
          documentNumber: true,
          studentFullName: true,
          previousSchoolName: true,
          academicYear: true,
          documentDate: true,
          createdAt: true,
        },
      }),
    ]);

    const pendingRows: StudentReportRow[] = pending.map((s) => ({
      name: this.fullName([
        s.firstName,
        s.secondName,
        s.thirdName,
        s.fourthName,
      ]),
      section: s.section?.trim() || '—',
      phones: this.formatPhones(s.phoneNumbers),
      stage: s.stage?.trim() || '—',
      guardian: (s.guardianName || s.guardianInfo || '—').trim(),
      date: this.formatDateTime(s.createdAt),
    }));

    const registeredRows: StudentReportRow[] = registered.map((s) => ({
      name: this.fullName([
        s.firstName,
        s.secondName,
        s.thirdName,
        s.fourthName,
      ]),
      section: s.section?.trim() || '—',
      phones: this.formatPhones(s.phoneNumbers),
      stage: s.stage?.trim() || '—',
      guardian: (s.guardianName || s.guardianInfo || '—').trim(),
      date: this.formatDateTime(s.registeredAt ?? new Date()),
    }));

    const documentRows: DocumentReportRow[] = letters.map((l) => ({
      documentNumber: l.documentNumber,
      studentName: l.studentFullName,
      previousSchool: l.previousSchoolName || '—',
      academicYear: l.academicYear || '—',
      date: this.formatDate(l.documentDate ?? l.createdAt),
    }));

    const buffer = await this.renderPdf(period, {
      pendingRows,
      registeredRows,
      documentRows,
    });

    const safeLabel = period.label.replace(/[^\w\-]+/g, '_').slice(0, 80);
    const fileName = `erpqalam-${period.kind}-report-${safeLabel}.pdf`;
    return { buffer, fileName };
  }

  private resolveFontPath(): string {
    const candidates = [
      join(
        process.cwd(),
        'dist',
        'src',
        'document-requests',
        'assets',
        'fonts',
        'Tajawal-Regular.ttf',
      ),
      join(
        process.cwd(),
        'src',
        'document-requests',
        'assets',
        'fonts',
        'Tajawal-Regular.ttf',
      ),
      join(
        __dirname,
        '..',
        'document-requests',
        'assets',
        'fonts',
        'Tajawal-Regular.ttf',
      ),
    ];
    for (const path of candidates) {
      if (existsSync(path)) return path;
    }
    throw new Error('Report font Tajawal-Regular.ttf not found');
  }

  private truncateToWidth(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string {
    const value = text || '—';
    if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
    let truncated = value;
    while (truncated.length > 1) {
      truncated = truncated.slice(0, -1);
      const candidate = `${truncated}…`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        return candidate;
      }
    }
    return '…';
  }

  private drawPageChrome(
    page: PDFPage,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    period: ReportPeriod,
    font: PDFFont,
  ) {
    page.drawRectangle({
      x: 0,
      y: pageHeight - 28,
      width: pageWidth,
      height: 28,
      color: COLORS.brand,
    });
    page.drawText('ERP Qalam activity report', {
      x: margin,
      y: pageHeight - 18,
      size: 10,
      font,
      color: COLORS.headerText,
    });
    page.drawText(period.kind.toUpperCase(), {
      x: pageWidth - margin - 70,
      y: pageHeight - 18,
      size: 10,
      font,
      color: COLORS.headerText,
    });
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: 18,
      color: COLORS.brandSoft,
    });
  }

  private drawTable(
    state: { page: PDFPage; y: number },
    opts: {
      title: string;
      emptyText: string;
      columns: TableColumn[];
      rows: Record<string, string>[];
      pdfDoc: PDFDocument;
      pageWidth: number;
      pageHeight: number;
      margin: number;
      contentWidth: number;
      font: PDFFont;
      period: ReportPeriod;
    },
  ): void {
    const {
      title,
      emptyText,
      columns,
      rows,
      pdfDoc,
      pageWidth,
      pageHeight,
      margin,
      contentWidth,
      font,
      period,
    } = opts;

    const rowHeight = 20;
    const headerHeight = 22;

    const newPage = () => {
      state.page = pdfDoc.addPage([pageWidth, pageHeight]);
      this.drawPageChrome(
        state.page,
        pageWidth,
        pageHeight,
        margin,
        period,
        font,
      );
      state.y = pageHeight - margin - 42;
    };

    const ensure = (needed: number) => {
      if (state.y - needed < margin + 10) {
        newPage();
      }
    };

    ensure(50);
    state.page.drawText(title, {
      x: margin,
      y: state.y,
      size: 12,
      font,
      color: COLORS.brand,
    });
    state.y -= 8;
    state.page.drawRectangle({
      x: margin,
      y: state.y - 2,
      width: 48,
      height: 2,
      color: COLORS.accent,
    });
    state.y -= 16;

    const drawHeader = () => {
      ensure(headerHeight + 4);
      state.page.drawRectangle({
        x: margin,
        y: state.y - headerHeight + 4,
        width: contentWidth,
        height: headerHeight,
        color: COLORS.headerBg,
      });
      let x = margin + 6;
      for (const col of columns) {
        state.page.drawText(col.label, {
          x,
          y: state.y - 10,
          size: 9,
          font,
          color: COLORS.headerText,
        });
        x += col.width;
      }
      state.y -= headerHeight;
    };

    drawHeader();

    if (rows.length === 0) {
      ensure(rowHeight);
      state.page.drawText(emptyText, {
        x: margin + 6,
        y: state.y - 12,
        size: 9,
        font,
        color: COLORS.muted,
      });
      state.y -= rowHeight + 14;
      return;
    }

    rows.forEach((row, index) => {
      if (state.y - rowHeight < margin + 10) {
        newPage();
        drawHeader();
      }

      const bg: RGB | undefined = index % 2 === 1 ? COLORS.rowAlt : undefined;
      if (bg) {
        state.page.drawRectangle({
          x: margin,
          y: state.y - rowHeight + 4,
          width: contentWidth,
          height: rowHeight,
          color: bg,
        });
      }

      state.page.drawRectangle({
        x: margin,
        y: state.y - rowHeight + 4,
        width: contentWidth,
        height: rowHeight,
        borderColor: COLORS.line,
        borderWidth: 0.4,
      });

      let x = margin + 6;
      for (const col of columns) {
        const cell = this.truncateToWidth(
          row[col.key] ?? '—',
          font,
          8.5,
          col.width - 10,
        );
        state.page.drawText(cell, {
          x,
          y: state.y - 10,
          size: 8.5,
          font,
          color: COLORS.ink,
        });
        x += col.width;
      }
      state.y -= rowHeight;
    });

    state.y -= 16;
  }

  private async renderPdf(
    period: ReportPeriod,
    data: {
      pendingRows: StudentReportRow[];
      registeredRows: StudentReportRow[];
      documentRows: DocumentReportRow[];
    },
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fs.readFile(this.resolveFontPath());
    const font = await pdfDoc.embedFont(fontBytes, { subset: true });

    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    this.drawPageChrome(page, pageWidth, pageHeight, margin, period, font);

    const state = { page, y: pageHeight - margin - 42 };

    const title =
      period.kind === 'daily'
        ? 'Daily activity report'
        : period.kind === 'weekly'
          ? 'Weekly activity report'
          : 'Monthly activity report';

    state.page.drawText('ERP Qalam', {
      x: margin,
      y: state.y,
      size: 18,
      font,
      color: COLORS.brand,
    });
    state.y -= 22;
    state.page.drawText(title, {
      x: margin,
      y: state.y,
      size: 13,
      font,
      color: COLORS.ink,
    });
    state.y -= 16;
    state.page.drawText(`Period: ${period.label}`, {
      x: margin,
      y: state.y,
      size: 10,
      font,
      color: COLORS.muted,
    });
    state.y -= 14;
    state.page.drawText(`Generated: ${this.formatDateTime(new Date())}`, {
      x: margin,
      y: state.y,
      size: 9,
      font,
      color: COLORS.muted,
    });
    state.y -= 18;

    const cardGap = 12;
    const cardW = (contentWidth - cardGap * 2) / 3;
    const cards = [
      { label: 'Pending students', value: String(data.pendingRows.length) },
      {
        label: 'Registered students',
        value: String(data.registeredRows.length),
      },
      {
        label: 'Document requests',
        value: String(data.documentRows.length),
      },
    ];
    cards.forEach((card, index) => {
      const x = margin + index * (cardW + cardGap);
      state.page.drawRectangle({
        x,
        y: state.y - 40,
        width: cardW,
        height: 48,
        color: COLORS.brandSoft,
        borderColor: COLORS.line,
        borderWidth: 1,
      });
      state.page.drawText(card.label, {
        x: x + 12,
        y: state.y - 14,
        size: 9,
        font,
        color: COLORS.muted,
      });
      state.page.drawText(card.value, {
        x: x + 12,
        y: state.y - 34,
        size: 18,
        font,
        color: COLORS.brand,
      });
    });
    state.y -= 64;

    const studentColumns: TableColumn[] = [
      { key: '#', label: '#', width: 28 },
      { key: 'name', label: 'Full name', width: 170 },
      { key: 'section', label: 'Section', width: 90 },
      { key: 'phones', label: 'Phone numbers', width: 150 },
      { key: 'stage', label: 'Stage', width: 70 },
      { key: 'guardian', label: 'Guardian', width: 130 },
      { key: 'date', label: 'Date / time', width: 110 },
    ];

    const documentColumns: TableColumn[] = [
      { key: '#', label: '#', width: 28 },
      { key: 'documentNumber', label: 'Doc #', width: 80 },
      { key: 'studentName', label: 'Student name', width: 180 },
      { key: 'previousSchool', label: 'Previous school', width: 220 },
      { key: 'academicYear', label: 'Academic year', width: 100 },
      { key: 'date', label: 'Date', width: 90 },
    ];

    const shared = {
      pdfDoc,
      pageWidth,
      pageHeight,
      margin,
      contentWidth,
      font,
      period,
    };

    this.drawTable(state, {
      ...shared,
      title: `Pending students (${data.pendingRows.length})`,
      emptyText: 'No pending students in this period.',
      columns: studentColumns,
      rows: data.pendingRows.map((row, i) => ({
        '#': String(i + 1),
        name: row.name,
        section: row.section,
        phones: row.phones,
        stage: row.stage,
        guardian: row.guardian,
        date: row.date,
      })),
    });

    this.drawTable(state, {
      ...shared,
      title: `Registered students (${data.registeredRows.length})`,
      emptyText: 'No registered students in this period.',
      columns: studentColumns,
      rows: data.registeredRows.map((row, i) => ({
        '#': String(i + 1),
        name: row.name,
        section: row.section,
        phones: row.phones,
        stage: row.stage,
        guardian: row.guardian,
        date: row.date,
      })),
    });

    this.drawTable(state, {
      ...shared,
      title: `Document request letters (${data.documentRows.length})`,
      emptyText: 'No document requests in this period.',
      columns: documentColumns,
      rows: data.documentRows.map((row, i) => ({
        '#': String(i + 1),
        documentNumber: row.documentNumber,
        studentName: row.studentName,
        previousSchool: row.previousSchool,
        academicYear: row.academicYear,
        date: row.date,
      })),
    });

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  async sendReport(
    kind: ReportKind,
    botToken: string,
    chatIds: string[],
    now = new Date(),
    mode: 'scheduled' | 'partial' = 'scheduled',
  ): Promise<{ sent: number; failed: string[]; fileName: string }> {
    const period = this.resolvePeriod(kind, now, mode);
    const { buffer, fileName } = await this.buildPdf(period);

    let sent = 0;
    const failed: string[] = [];

    for (const chatId of chatIds) {
      try {
        await this.backupService.sendTelegramDocumentBuffer(
          botToken,
          chatId,
          buffer,
          fileName,
          {
            contentType: 'application/pdf',
            caption: `ERP Qalam ${kind} report — ${period.label}`,
          },
        );
        sent += 1;
      } catch (err) {
        this.logger.error(
          `Failed to send ${kind} report to ${chatId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        failed.push(chatId);
      }
    }

    return { sent, failed, fileName };
  }
}
