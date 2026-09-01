import { Injectable } from '@nestjs/common';
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
import type { PunchType } from './attendance-rules';
import type { EmployeeDayRow } from './attendance-rules';
import type { EmployeeReportPdfType } from './dto/attendance.dto';

const COLORS = {
  brand: rgb(0.05, 0.42, 0.42),
  brandSoft: rgb(0.9, 0.96, 0.95),
  ink: rgb(0.12, 0.14, 0.18),
  muted: rgb(0.4, 0.45, 0.5),
  line: rgb(0.82, 0.86, 0.88),
  headerBg: rgb(0.05, 0.42, 0.42),
  headerText: rgb(1, 1, 1),
  rowAlt: rgb(0.96, 0.98, 0.98),
  accent: rgb(0.91, 0.35, 0.05),
  late: rgb(0.72, 0.11, 0.11),
  absent: rgb(0.72, 0.4, 0.05),
  ok: rgb(0.05, 0.47, 0.35),
  holiday: rgb(0.13, 0.37, 0.65),
};

const PUNCH_LABELS: Record<PunchType, string> = {
  entry_on_time: 'دخول في الوقت',
  entry_late: 'دخول متأخر',
  exit: 'خروج',
  early_exit: 'خروج مبكر',
  out_of_shift: 'خارج الدوام',
};

type TableColumn = { key: string; label: string; width: number };

export type EmployeeReportPdfRow = {
  deviceUserId: string;
  name: string;
  workingDaysPresent: number;
  expectedWorkingDays: number;
  daysAbsent: number;
  lateCount: number;
  leaveBalance: number;
};

export type EmployeeReportPdfPayload = {
  type: EmployeeReportPdfType;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  rows: EmployeeReportPdfRow[];
  totals: {
    empCount: number;
    totalPresent: number;
    totalExpected: number;
    totalAbsent: number;
    totalLate: number;
    avgRate: number;
  };
  selectedEmployee?: {
    deviceUserId: string;
    name: string;
    present: number;
    expected: number;
    absent: number;
    leaveBalance: number;
    notComing: number;
    days: EmployeeDayRow[];
  };
};

@Injectable()
export class AttendanceReportPdfService {
  async render(
    payload: EmployeeReportPdfPayload,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fs.readFile(this.resolveFontPath());
    const font = await pdfDoc.embedFont(fontBytes, { subset: true });

    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const title = this.titleFor(payload.type);
    this.drawChrome(page, pageWidth, pageHeight, margin, font, title);
    const state = { page, y: pageHeight - margin - 40 };

    this.drawText(state.page, 'ERP Qalam', margin, state.y, 16, font, COLORS.brand);
    state.y -= 20;
    this.drawText(state.page, title, margin, state.y, 13, font, COLORS.ink);
    state.y -= 16;
    const period = [payload.fromDate, payload.toDate].filter(Boolean).join(' – ') || '—';
    this.drawText(
      state.page,
      `الفترة: ${period}    |    تاريخ التصدير: ${payload.generatedAt}`,
      margin,
      state.y,
      9,
      font,
      COLORS.muted,
    );
    state.y -= 22;

    if (payload.type === 'per-employee' && payload.selectedEmployee) {
      const emp = payload.selectedEmployee;
      this.drawText(
        state.page,
        `${emp.name} (${emp.deviceUserId})`,
        margin,
        state.y,
        12,
        font,
        COLORS.ink,
      );
      state.y -= 18;
      this.drawStatCards(
        state,
        [
          { label: 'أيام الحضور', value: String(emp.present) },
          { label: 'أيام متوقعة', value: String(emp.expected) },
          { label: 'أيام الغياب', value: String(emp.absent) },
          { label: 'لم يحضر', value: String(emp.notComing) },
          { label: 'رصيد الإجازات', value: String(emp.leaveBalance) },
        ],
        margin,
        contentWidth,
        font,
      );
      this.drawTable(
        state,
        {
          title: 'أوقات الدخول والخروج',
          emptyText: 'لا توجد بيانات حضور لهذه الفترة.',
          columns: [
            { key: 'date', label: 'التاريخ', width: 90 },
            { key: 'entryTime', label: 'وقت الدخول', width: 90 },
            { key: 'entryType', label: 'نوع الدخول', width: 130 },
            { key: 'exitTime', label: 'وقت الخروج', width: 90 },
            { key: 'exitType', label: 'نوع الخروج', width: 130 },
            { key: 'status', label: 'الحالة', width: contentWidth - 620 },
          ],
          rows: emp.days.map((day) => this.dayToRow(day)),
          colors: emp.days.map((day) => this.dayColor(day)),
        },
        {
          pdfDoc,
          pageWidth,
          pageHeight,
          margin,
          contentWidth,
          font,
          title,
        },
      );
    } else {
      this.drawStatCards(
        state,
        [
          { label: 'عدد الموظفين', value: String(payload.totals.empCount) },
          { label: 'إجمالي الحضور', value: String(payload.totals.totalPresent) },
          { label: 'إجمالي المتوقع', value: String(payload.totals.totalExpected) },
          { label: 'إجمالي الغياب', value: String(payload.totals.totalAbsent) },
          { label: 'إجمالي التأخير', value: String(payload.totals.totalLate) },
          { label: 'نسبة الحضور %', value: `${payload.totals.avgRate.toFixed(1)}%` },
        ],
        margin,
        contentWidth,
        font,
      );

      const includeLeave = payload.type === 'performance';
      const leaveWidth = includeLeave ? 90 : 0;
      const remaining = contentWidth - 70 - 90 - 80 - 80 - 80 - leaveWidth;
      this.drawTable(
        state,
        {
          title:
            payload.type === 'summary'
              ? 'جدول ملخص الموظفين'
              : 'جدول مقارنة الأداء',
          emptyText: 'لا توجد بيانات حضور لهذه الفترة.',
          columns: [
            { key: 'id', label: 'المعرّف', width: 70 },
            { key: 'name', label: 'الاسم', width: remaining },
            { key: 'present', label: 'أيام الحضور', width: 90 },
            { key: 'expected', label: 'أيام متوقعة', width: 80 },
            { key: 'absent', label: 'أيام الغياب', width: 80 },
            { key: 'late', label: 'أيام التأخير', width: 80 },
            ...(includeLeave
              ? [{ key: 'leave', label: 'رصيد الإجازات', width: leaveWidth }]
              : []),
          ],
          rows: payload.rows.map((row) => ({
            id: row.deviceUserId,
            name: row.name,
            present: String(row.workingDaysPresent),
            expected: String(row.expectedWorkingDays),
            absent: String(row.daysAbsent),
            late: String(row.lateCount),
            leave: String(row.leaveBalance),
          })),
        },
        {
          pdfDoc,
          pageWidth,
          pageHeight,
          margin,
          contentWidth,
          font,
          title,
        },
      );
    }

    const bytes = await pdfDoc.save();
    const fileName = `attendance-report-${payload.type}-${payload.fromDate || 'all'}-${payload.toDate || 'all'}.pdf`;
    return { buffer: Buffer.from(bytes), fileName };
  }

  private titleFor(type: EmployeeReportPdfType): string {
    if (type === 'per-employee') return 'تقرير لكل موظف';
    if (type === 'summary') return 'ملخص عام لجميع الموظفين';
    return 'مقارنة أداء الموظفين';
  }

  private dayToRow(day: EmployeeDayRow): Record<string, string> {
    if (day.isHoliday) {
      return {
        date: this.formatDate(day.date),
        entryTime: '–',
        entryType: 'إجازة مسبقة',
        exitTime: '–',
        exitType: 'إجازة مسبقة',
        status: 'إجازة',
      };
    }
    if (day.isNotComing) {
      return {
        date: this.formatDate(day.date),
        entryTime: '–',
        entryType: 'لم يحضر',
        exitTime: '–',
        exitType: 'لم يحضر',
        status: 'لم يبصم نهائياً',
      };
    }
    return {
      date: this.formatDate(day.date),
      entryTime: this.formatTime(day.entryTime),
      entryType: day.entryType ? PUNCH_LABELS[day.entryType] : '–',
      exitTime: this.formatTime(day.exitTime),
      exitType: day.exitType ? PUNCH_LABELS[day.exitType] : '–',
      status: '',
    };
  }

  private dayColor(day: EmployeeDayRow): RGB | undefined {
    if (day.isHoliday) return COLORS.holiday;
    if (day.isNotComing) return COLORS.late;
    if (day.entryType === 'entry_late' || day.exitType === 'early_exit') {
      return COLORS.absent;
    }
    return undefined;
  }

  private formatDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  private formatTime(ts: string | null): string {
    if (!ts) return '–';
    const match = ts.match(/T(\d{2}):(\d{2})/);
    if (!match) return '–';
    const h24 = parseInt(match[1], 10);
    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'ص' : 'م';
    return `${h12}:${match[2]} ${ampm}`;
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

  private drawText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: RGB,
  ) {
    page.drawText(text, { x, y, size, font, color });
  }

  private drawChrome(
    page: PDFPage,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    font: PDFFont,
    title: string,
  ) {
    page.drawRectangle({
      x: 0,
      y: pageHeight - 26,
      width: pageWidth,
      height: 26,
      color: COLORS.brand,
    });
    this.drawText(
      page,
      'تقرير الحضور — ERP Qalam',
      margin,
      pageHeight - 17,
      10,
      font,
      COLORS.headerText,
    );
    this.drawText(
      page,
      title,
      pageWidth - margin - font.widthOfTextAtSize(title, 9) - 4,
      pageHeight - 17,
      9,
      font,
      COLORS.headerText,
    );
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: 16,
      color: COLORS.brandSoft,
    });
  }

  private drawStatCards(
    state: { page: PDFPage; y: number },
    stats: { label: string; value: string }[],
    margin: number,
    contentWidth: number,
    font: PDFFont,
  ) {
    const gap = 8;
    const cardW = (contentWidth - gap * (stats.length - 1)) / stats.length;
    const cardH = 42;
    stats.forEach((stat, index) => {
      const x = margin + index * (cardW + gap);
      state.page.drawRectangle({
        x,
        y: state.y - cardH,
        width: cardW,
        height: cardH,
        color: COLORS.brandSoft,
        borderColor: COLORS.line,
        borderWidth: 0.6,
      });
      this.drawText(
        state.page,
        stat.label,
        x + 8,
        state.y - 14,
        8,
        font,
        COLORS.muted,
      );
      this.drawText(
        state.page,
        stat.value,
        x + 8,
        state.y - 32,
        13,
        font,
        COLORS.brand,
      );
    });
    state.y -= cardH + 18;
  }

  private drawTable(
    state: { page: PDFPage; y: number },
    table: {
      title: string;
      emptyText: string;
      columns: TableColumn[];
      rows: Record<string, string>[];
      colors?: Array<RGB | undefined>;
    },
    ctx: {
      pdfDoc: PDFDocument;
      pageWidth: number;
      pageHeight: number;
      margin: number;
      contentWidth: number;
      font: PDFFont;
      title: string;
    },
  ) {
    const rowHeight = 18;
    const headerHeight = 20;

    const newPage = () => {
      state.page = ctx.pdfDoc.addPage([ctx.pageWidth, ctx.pageHeight]);
      this.drawChrome(
        state.page,
        ctx.pageWidth,
        ctx.pageHeight,
        ctx.margin,
        ctx.font,
        ctx.title,
      );
      state.y = ctx.pageHeight - ctx.margin - 36;
    };

    const ensure = (needed: number) => {
      if (state.y - needed < ctx.margin + 10) newPage();
    };

    ensure(36);
    this.drawText(state.page, table.title, ctx.margin, state.y, 11, ctx.font, COLORS.brand);
    state.y -= 6;
    state.page.drawRectangle({
      x: ctx.margin,
      y: state.y - 1,
      width: 40,
      height: 2,
      color: COLORS.accent,
    });
    state.y -= 14;

    const drawHeader = () => {
      ensure(headerHeight + 4);
      state.page.drawRectangle({
        x: ctx.margin,
        y: state.y - headerHeight + 4,
        width: ctx.contentWidth,
        height: headerHeight,
        color: COLORS.headerBg,
      });
      let x = ctx.margin + 5;
      for (const col of table.columns) {
        this.drawText(
          state.page,
          col.label,
          x,
          state.y - 9,
          8,
          ctx.font,
          COLORS.headerText,
        );
        x += col.width;
      }
      state.y -= headerHeight;
    };

    drawHeader();

    if (table.rows.length === 0) {
      ensure(rowHeight);
      this.drawText(
        state.page,
        table.emptyText,
        ctx.margin + 6,
        state.y - 11,
        9,
        ctx.font,
        COLORS.muted,
      );
      return;
    }

    table.rows.forEach((row, index) => {
      if (state.y - rowHeight < ctx.margin + 10) {
        newPage();
        drawHeader();
      }
      const bg = index % 2 === 1 ? COLORS.rowAlt : undefined;
      if (bg) {
        state.page.drawRectangle({
          x: ctx.margin,
          y: state.y - rowHeight + 4,
          width: ctx.contentWidth,
          height: rowHeight,
          color: bg,
        });
      }
      state.page.drawRectangle({
        x: ctx.margin,
        y: state.y - rowHeight + 4,
        width: ctx.contentWidth,
        height: rowHeight,
        borderColor: COLORS.line,
        borderWidth: 0.35,
      });
      let x = ctx.margin + 5;
      for (const col of table.columns) {
        const cell = this.truncateToWidth(
          row[col.key] ?? '—',
          ctx.font,
          8,
          col.width - 8,
        );
        this.drawText(
          state.page,
          cell,
          x,
          state.y - 9,
          8,
          ctx.font,
          table.colors?.[index] ?? COLORS.ink,
        );
        x += col.width;
      }
      state.y -= rowHeight;
    });
  }
}
