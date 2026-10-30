import type { PunchType } from '../attendance-rules';
import {
  DEFAULT_ATTENDANCE_SETTINGS,
  type AttendanceSettingsMap,
} from '../attendance-rules';
import type { EmployeeReportPdfPayload } from '../attendance-report-pdf.types';
import { escapeHtml } from './escape';
import {
  formatDateFromKey,
  formatExportDate,
  formatTime12FromHHMM,
  formatTimeFromLocalTs,
} from './format';
import { REPORT_SHELL_CSS } from './shell-styles';

const PUNCH_LABELS: Record<PunchType, string> = {
  entry_on_time: 'دخول في الوقت',
  entry_late: 'دخول متأخر',
  exit: 'خروج',
  early_exit: 'خروج مبكر',
  out_of_shift: 'خارج الدوام',
};

export type PdfBranding = {
  schoolName: string;
  logoDataUri: string | null;
};

export type ReportHtmlFontAssets = {
  regularBase64: string;
  boldBase64: string | null;
};

function statCardsHtml(
  stats: { label: string; value: string; color: string }[],
): string {
  return `
      <div class="stats">
        ${stats
          .map(
            (s) => `
          <div class="stat-card ${s.color}">
            <div class="stat-label" dir="rtl">${escapeHtml(s.label)}</div>
            <div class="stat-value">${escapeHtml(s.value)}</div>
          </div>
        `,
          )
          .join('')}
      </div>`;
}

function buildBodyContent(payload: EmployeeReportPdfPayload): string {
  const { type } = payload;

  if (type === 'performance') {
    const fromTo = [payload.fromDate, payload.toDate].filter(Boolean).join(' – ');
    const perfSummary = {
      empCount: payload.rows.length,
      totalPresent: payload.totals.totalPresent,
      totalExpected: payload.totals.totalExpected,
      totalAbsent: payload.totals.totalAbsent,
      totalLate: payload.totals.totalLate,
    };
    const perfAvgRate =
      perfSummary.totalExpected > 0
        ? ((perfSummary.totalPresent / perfSummary.totalExpected) * 100).toFixed(1) +
          '%'
        : '0%';
    const perfStats = [
      { label: 'عدد الموظفين', value: String(perfSummary.empCount), color: 'slate' },
      {
        label: 'إجمالي الحضور',
        value: String(perfSummary.totalPresent),
        color: 'emerald',
      },
      {
        label: 'إجمالي المتوقع',
        value: String(perfSummary.totalExpected),
        color: 'slate',
      },
      {
        label: 'إجمالي الغياب',
        value: String(perfSummary.totalAbsent),
        color: 'amber',
      },
      {
        label: 'إجمالي التأخير',
        value: String(perfSummary.totalLate),
        color: 'red',
      },
      { label: 'نسبة الحضور %', value: perfAvgRate, color: 'blue' },
    ];
    return `
      <div class="title" dir="rtl">مقارنة أداء الموظفين</div>
      ${fromTo ? `<div class="period">الفترة: ${escapeHtml(fromTo)}</div>` : ''}
      ${statCardsHtml(perfStats)}
      <div class="section-heading" dir="rtl">جدول مقارنة الأداء</div>
      <table>
        <thead>
          <tr>
            <th dir="rtl">المعرّف</th>
            <th dir="rtl">الاسم</th>
            <th dir="rtl">أيام الحضور</th>
            <th dir="rtl">أيام متوقعة</th>
            <th dir="rtl">أيام الغياب</th>
            <th dir="rtl">أيام التأخير</th>
            <th dir="rtl">رصيد الإجازات</th>
          </tr>
        </thead>
        <tbody>
          ${payload.rows
            .map(
              (row) => `
            <tr>
              <td>${escapeHtml(row.deviceUserId)}</td>
              <td dir="rtl">${escapeHtml(row.name || row.deviceUserId)}</td>
              <td>${escapeHtml(row.workingDaysPresent)}</td>
              <td>${escapeHtml(row.expectedWorkingDays)}</td>
              <td class="${row.daysAbsent > 0 ? 'text-amber' : ''}">${escapeHtml(row.daysAbsent)}</td>
              <td class="${row.lateCount > 0 ? 'text-red' : ''}">${escapeHtml(row.lateCount)}</td>
              <td>${escapeHtml(row.leaveBalance)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  if (type === 'per-employee' && payload.selectedEmployee) {
    const emp = payload.selectedEmployee;
    const fromTo = [payload.fromDate, payload.toDate].filter(Boolean).join(' – ');
    const stats = [
      { label: 'أيام الحضور', value: String(emp.present), color: 'emerald' },
      { label: 'أيام متوقعة', value: String(emp.expected), color: 'slate' },
      { label: 'أيام الغياب', value: String(emp.absent), color: 'amber' },
      { label: 'رصيد الإجازات', value: String(emp.leaveBalance), color: 'blue' },
    ];
    return `
      <div class="title" dir="rtl">تقرير لكل موظف: ${escapeHtml(emp.name)}</div>
      ${fromTo ? `<div class="period">الفترة: ${escapeHtml(fromTo)}</div>` : ''}
      ${statCardsHtml(stats)}
      <div class="section-heading" dir="rtl">أوقات الدخول والخروج</div>
      <table>
        <thead>
          <tr>
            <th dir="rtl">التاريخ</th>
            <th dir="rtl">وقت الدخول</th>
            <th dir="rtl">نوع الدخول</th>
            <th dir="rtl">وقت الخروج</th>
            <th dir="rtl">نوع الخروج</th>
            <th dir="rtl">إجراء</th>
          </tr>
        </thead>
        <tbody>
          ${emp.days
            .map((d) => {
              const isHoliday = d.isHoliday === true;
              const isNotComing = d.isNotComing === true;
              let entryType: string;
              let exitType: string;
              let entryTime: string;
              let exitTime: string;
              let action: string;
              if (isHoliday) {
                entryType = exitType = 'إجازة';
                entryTime = exitTime = '–';
                action = 'إجازة';
              } else if (isNotComing) {
                entryType = exitType = 'لم يحضر';
                entryTime = exitTime = '–';
                action = 'لم يبصم نهائياً';
              } else {
                entryType = d.entryType
                  ? PUNCH_LABELS[d.entryType] || d.entryType
                  : '–';
                exitType = d.exitType
                  ? PUNCH_LABELS[d.exitType] || d.exitType
                  : '–';
                entryTime = formatTimeFromLocalTs(d.entryTime);
                exitTime = formatTimeFromLocalTs(d.exitTime);
                action = '';
              }
              const dateStr = formatDateFromKey(d.date);
              const rowClass = isHoliday
                ? 'row-holiday'
                : isNotComing
                  ? 'row-absent'
                  : '';
              const entryClass =
                !isHoliday && !isNotComing && d.entryType === 'entry_late'
                  ? 'text-red'
                  : !isHoliday && !isNotComing && d.entryType === 'entry_on_time'
                    ? 'text-emerald'
                    : isNotComing
                      ? 'text-red'
                      : isHoliday
                        ? 'text-blue'
                        : '';
              const exitClass =
                !isHoliday && !isNotComing && d.exitType === 'early_exit'
                  ? 'text-amber'
                  : isNotComing
                    ? 'text-red'
                    : isHoliday
                      ? 'text-blue'
                      : '';
              return `
            <tr class="${rowClass}">
              <td>${escapeHtml(dateStr)}</td>
              <td class="${entryClass}">${escapeHtml(entryTime)}</td>
              <td class="${entryClass}" dir="rtl">${escapeHtml(entryType)}</td>
              <td class="${exitClass}">${escapeHtml(exitTime)}</td>
              <td class="${exitClass}" dir="rtl">${escapeHtml(exitType)}</td>
              <td dir="rtl">${escapeHtml(action)}</td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }

  if (type === 'daily' && payload.daily) {
    const { daily } = payload;
    const dateStr = daily.date ? formatDateFromKey(daily.date) : '';
    const summary = daily.summary;
    const dayOffVal = summary.dayOff + summary.officialHoliday;
    const stats = [
      {
        label: 'عدد الموظفين',
        value: String(summary.employeeCount),
        color: 'slate',
      },
      { label: 'حاضر', value: String(summary.present), color: 'emerald' },
      { label: 'غائب', value: String(summary.absent), color: 'amber' },
      { label: 'إجازة', value: String(summary.onLeave), color: 'blue' },
      ...(dayOffVal > 0
        ? [{ label: 'يوم عطلة', value: String(dayOffVal), color: 'blue' }]
        : []),
      { label: 'متأخر', value: String(summary.late), color: 'red' },
      { label: 'خروج مبكر', value: String(summary.earlyExit), color: 'red' },
    ];

    type HratDailyStatus = 'holiday' | 'dayOff' | 'absent' | 'present';

    const toHratStatus = (status: string): HratDailyStatus => {
      if (status === 'on_leave') return 'holiday';
      if (
        status === 'official_holiday' ||
        status === 'day_off'
      ) {
        return 'dayOff';
      }
      if (status === 'absent') return 'absent';
      return 'present';
    };

    return `
      <div class="title" dir="rtl">تقرير يومي</div>
      ${dateStr ? `<div class="period">التاريخ: ${escapeHtml(dateStr)}</div>` : ''}
      ${statCardsHtml(stats)}
      <div class="section-heading" dir="rtl">تفاصيل الحضور والانصراف</div>
      <table>
        <thead>
          <tr>
            <th dir="rtl">المعرّف</th>
            <th dir="rtl">الاسم</th>
            <th dir="rtl">الحالة</th>
            <th dir="rtl">وقت الدخول</th>
            <th dir="rtl">نوع الدخول</th>
            <th dir="rtl">وقت الخروج</th>
            <th dir="rtl">نوع الخروج</th>
          </tr>
        </thead>
        <tbody>
          ${daily.rows
            .map((row) => {
              const hrat = toHratStatus(row.status);
              const isHoliday = hrat === 'holiday';
              const isDayOff = hrat === 'dayOff';
              const isAbsent = hrat === 'absent';
              let statusLabel = 'حاضر';
              if (isHoliday) statusLabel = 'إجازة';
              else if (isDayOff) statusLabel = 'يوم عطلة';
              else if (isAbsent) statusLabel = 'غائب';

              let entryTime = '–';
              let entryType = '–';
              let exitTime = '–';
              let exitType = '–';
              if (!isHoliday && !isDayOff && !isAbsent) {
                entryTime = formatTimeFromLocalTs(row.entryTime);
                entryType = row.entryType
                  ? PUNCH_LABELS[row.entryType] || row.entryType
                  : '–';
                exitTime = formatTimeFromLocalTs(row.exitTime);
                exitType = row.exitType
                  ? PUNCH_LABELS[row.exitType] || row.exitType
                  : '–';
              }

              const rowClass = isHoliday
                ? 'row-holiday'
                : isAbsent
                  ? 'row-absent'
                  : '';
              const statusClass = isHoliday
                ? 'text-blue'
                : isAbsent
                  ? 'text-red'
                  : 'text-emerald';
              const entryClass =
                row.entryType === 'entry_late'
                  ? 'text-red'
                  : row.entryType === 'entry_on_time'
                    ? 'text-emerald'
                    : '';
              const exitClass =
                row.exitType === 'early_exit' ? 'text-amber' : '';

              return `
            <tr class="${rowClass}">
              <td>${escapeHtml(row.deviceUserId)}</td>
              <td dir="rtl">${escapeHtml(row.name || row.deviceUserId)}</td>
              <td class="${statusClass}" dir="rtl">${escapeHtml(statusLabel)}</td>
              <td class="${entryClass}">${escapeHtml(entryTime)}</td>
              <td class="${entryClass}" dir="rtl">${escapeHtml(entryType)}</td>
              <td class="${exitClass}">${escapeHtml(exitTime)}</td>
              <td class="${exitClass}" dir="rtl">${escapeHtml(exitType)}</td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }

  if (type === 'summary') {
    const fromTo = [payload.fromDate, payload.toDate].filter(Boolean).join(' – ');
    const summaryStats = [
      { label: 'عدد الموظفين', value: String(payload.totals.empCount), color: 'slate' },
      {
        label: 'إجمالي الحضور',
        value: String(payload.totals.totalPresent),
        color: 'emerald',
      },
      {
        label: 'إجمالي المتوقع',
        value: String(payload.totals.totalExpected),
        color: 'slate',
      },
      {
        label: 'إجمالي الغياب',
        value: String(payload.totals.totalAbsent),
        color: 'amber',
      },
      {
        label: 'إجمالي التأخير',
        value: String(payload.totals.totalLate),
        color: 'red',
      },
      {
        label: 'نسبة الحضور %',
        value: `${payload.totals.avgRate.toFixed(1)}%`,
        color: 'blue',
      },
    ];
    return `
      <div class="title" dir="rtl">ملخص عام لجميع الموظفين</div>
      ${fromTo ? `<div class="period">الفترة: ${escapeHtml(fromTo)}</div>` : ''}
      ${statCardsHtml(summaryStats)}
      <div class="section-heading" dir="rtl">جدول ملخص الموظفين</div>
      <table>
        <thead>
          <tr>
            <th dir="rtl">المعرّف</th>
            <th dir="rtl">الاسم</th>
            <th dir="rtl">أيام الحضور</th>
            <th dir="rtl">أيام متوقعة</th>
            <th dir="rtl">أيام الغياب</th>
            <th dir="rtl">أيام التأخير</th>
          </tr>
        </thead>
        <tbody>
          ${payload.rows
            .map(
              (row) => `
            <tr>
              <td>${escapeHtml(row.deviceUserId)}</td>
              <td dir="rtl">${escapeHtml(row.name || row.deviceUserId)}</td>
              <td>${escapeHtml(row.workingDaysPresent)}</td>
              <td>${escapeHtml(row.expectedWorkingDays)}</td>
              <td class="${row.daysAbsent > 0 ? 'text-amber' : ''}">${escapeHtml(row.daysAbsent)}</td>
              <td class="${row.lateCount > 0 ? 'text-red' : ''}">${escapeHtml(row.lateCount)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  if (type === 'time-shifts') {
    const s = payload.settings ?? DEFAULT_ATTENDANCE_SETTINGS;
    const shiftStart = s.shift_start_time.toString().slice(0, 5);
    const shiftEnd = s.shift_end_time.toString().slice(0, 5);
    const entryStart = s.entry_zone_start.toString().slice(0, 5);
    const entryEnd = s.entry_zone_end.toString().slice(0, 5);
    const exitStart = s.exit_zone_start.toString().slice(0, 5);
    const exitEnd = s.exit_zone_end.toString().slice(0, 5);
    const lateStart = s.late_zone_start_time.toString().slice(0, 5);
    const lateEnd = s.late_zone_end_time.toString().slice(0, 5);
    const earlyLeftStart = s.early_left_zone_start_time.toString().slice(0, 5);
    const earlyLeftEnd = s.early_left_zone_end_time.toString().slice(0, 5);
    const workingDays = Array.isArray(s.working_days)
      ? s.working_days
      : DEFAULT_ATTENDANCE_SETTINGS.working_days;
    const DAY_LABELS = [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    const workingDaysLabels =
      workingDays
        .map((d) => DAY_LABELS[d])
        .filter(Boolean)
        .join('، ') || 'الأحد – الخميس';

    const zonesTable = [
      {
        zone: 'منطقة الدخول',
        from: formatTime12FromHHMM(entryStart),
        to: formatTime12FromHHMM(entryEnd),
        type: 'دخول في الوقت',
        desc: 'البصمة في هذا الوقت تُحسب دخولاً في الموعد.',
      },
      {
        zone: 'فترة التأخير',
        from: formatTime12FromHHMM(lateStart),
        to: formatTime12FromHHMM(lateEnd),
        type: 'دخول متأخر',
        desc: 'البصمة في هذا الوقت تُحسب دخولاً متأخراً.',
      },
      {
        zone: 'الدوام الرسمي',
        from: formatTime12FromHHMM(shiftStart),
        to: formatTime12FromHHMM(shiftEnd),
        type: '–',
        desc: 'بداية ونهاية الشيفت الرسمي.',
      },
      {
        zone: 'منطقة الخروج',
        from: formatTime12FromHHMM(exitStart),
        to: formatTime12FromHHMM(exitEnd),
        type: 'خروج',
        desc: 'البصمة في هذا الوقت تُحسب خروجاً عادياً.',
      },
      {
        zone: 'فترة الانصراف المبكر',
        from: formatTime12FromHHMM(earlyLeftStart),
        to: formatTime12FromHHMM(earlyLeftEnd),
        type: 'خروج مبكر',
        desc: 'البصمة في هذا الوقت تُحسب خروجاً مبكراً.',
      },
    ];

    return `
      <div class="title" dir="rtl">تقرير أوقات الدوام</div>
      <p class="period" dir="rtl">دليل للموظفين لفهم كيفية احتساب أوقات الحضور والانصراف</p>

      <div class="section-heading" dir="rtl">جدول المناطق الزمنية</div>
      <table>
        <thead>
          <tr>
            <th dir="rtl">المنطقة</th>
            <th dir="rtl">من</th>
            <th dir="rtl">إلى</th>
            <th dir="rtl">التصنيف</th>
            <th dir="rtl">شرح مختصر</th>
          </tr>
        </thead>
        <tbody>
          ${zonesTable
            .map(
              (z) => `
            <tr>
              <td dir="rtl">${escapeHtml(z.zone)}</td>
              <td>${escapeHtml(z.from)}</td>
              <td>${escapeHtml(z.to)}</td>
              <td dir="rtl">${escapeHtml(z.type)}</td>
              <td dir="rtl" style="font-size:11px;color:#64748b">${escapeHtml(z.desc)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>

      <div class="section-heading" dir="rtl" style="margin-top:28px">كيف تُحسب بصماتك؟</div>
      <div class="explain-box" dir="rtl">
        <ul style="margin:0;padding-right:20px;line-height:1.9">
          <li>بصمة الدخول الأولى في <strong>منطقة الدخول</strong> أو <strong>فترة التأخير</strong> تُحسب دخولك.</li>
          <li>بصمة الخروج الأخيرة في <strong>منطقة الخروج</strong> أو <strong>فترة الانصراف المبكر</strong> تُحسب خروجك.</li>
          <li>أي بصمة خارج هذه الأوقات تُحسب <strong>خارج الدوام</strong> ولا تدخل في احتساب الحضور.</li>
        </ul>
      </div>

      <div class="section-heading" dir="rtl" style="margin-top:28px">نصائح</div>
      <div class="explain-box" dir="rtl">
        <ul style="margin:0;padding-right:20px;line-height:1.9">
          <li>أفضل وقت للدخول: قبل نهاية منطقة الدخول (قبل ${escapeHtml(formatTime12FromHHMM(entryEnd))}) لتُحسب دخولاً في الموعد.</li>
          <li>أفضل وقت للخروج: داخل منطقة الخروج (${escapeHtml(formatTime12FromHHMM(exitStart))} – ${escapeHtml(formatTime12FromHHMM(exitEnd))}).</li>
          <li>تجنّب البصمة خارج المناطق المحددة حتى تُحسب ضمن الدوام.</li>
        </ul>
      </div>

      <div class="section-heading" dir="rtl" style="margin-top:28px">أيام الدوام</div>
      <p dir="rtl" style="margin:0;font-weight:600;color:#334155">${escapeHtml(workingDaysLabels)}</p>
      <p dir="rtl" style="margin:8px 0 0 0;font-size:12px;color:#64748b">أيام العطل لا يُتوقع فيها الحضور.</p>
    `;
  }

  return '<p style="color:#64748b" dir="rtl">لا توجد بيانات لعرضها</p>';
}

export function buildReportHtml(
  payload: EmployeeReportPdfPayload,
  branding: PdfBranding,
  fonts: ReportHtmlFontAssets,
): string {
  const exportDate = formatExportDate();
  const bodyContent = buildBodyContent(payload);
  const schoolName = branding.schoolName.trim() || '—';

  const logoImg = branding.logoDataUri
    ? `<img src="${branding.logoDataUri}" alt="Logo" class="header-logo" />`
    : '';

  const fontFaceCss =
    fonts.regularBase64 || fonts.boldBase64
      ? `
    @font-face {
      font-family: 'Tajawal';
      font-style: normal;
      font-weight: 400;
      src: url(data:font/ttf;base64,${fonts.regularBase64 || fonts.boldBase64}) format('truetype');
    }
    ${
      fonts.boldBase64
        ? `@font-face {
      font-family: 'Tajawal';
      font-style: normal;
      font-weight: 700;
      src: url(data:font/ttf;base64,${fonts.boldBase64}) format('truetype');
    }`
        : ''
    }
  `
      : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام حضور و انصراف - تقرير</title>
  <style>
    ${fontFaceCss}
    ${REPORT_SHELL_CSS}
  </style>
</head>
<body>
  <header class="header">
    <div class="header-brand">
      <div class="header-logo-title">
        ${logoImg}
        <div>
          <h1 dir="rtl">نظام حضور و انصراف</h1>
          <p class="sub" dir="rtl">${escapeHtml(schoolName)}</p>
        </div>
      </div>
    </div>
    <div class="meta">
      <p class="report-type" dir="rtl">تقرير الحضور</p>
      <p>${escapeHtml(exportDate)}</p>
    </div>
  </header>

  <main>
    ${bodyContent}
  </main>

  <footer class="footer">
    <p dir="rtl">${escapeHtml(schoolName)}</p>
    <p>${escapeHtml(exportDate)}</p>
  </footer>
</body>
</html>`;
}
