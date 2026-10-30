import type { PunchType } from '../attendance-rules';
import type { EmployeeReportPdfEmployeeDetail } from '../attendance-report-pdf.types';
import { escapeHtml } from './escape';
import { formatDateFromKey, formatTimeFromLocalTs } from './format';

const PUNCH_LABELS: Record<PunchType, string> = {
  entry_on_time: 'دخول في الوقت',
  entry_late: 'دخول متأخر',
  exit: 'خروج',
  early_exit: 'خروج مبكر',
  out_of_shift: 'خارج الدوام',
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

/** HRAT per-employee block (stats + in/out table). */
export function buildPerEmployeeSectionHtml(
  emp: EmployeeReportPdfEmployeeDetail,
  fromDate: string,
  toDate: string,
): string {
  const fromTo = [fromDate, toDate].filter(Boolean).join(' – ');
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
