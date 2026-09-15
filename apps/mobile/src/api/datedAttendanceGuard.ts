const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type DatedAttendanceLog = {
  at: string;
  path: string;
  fromDate: string;
  toDate: string;
};

export const datedAttendanceRequestLog: DatedAttendanceLog[] = [];

export function resetDatedAttendanceRequestLog(): void {
  datedAttendanceRequestLog.length = 0;
}

/** Throws if a records/report request would omit the date window. */
export function assertDatedAttendancePath(path: string): void {
  const url = new URL(path, 'https://erpqalam.invalid');
  const isRecords = url.pathname === '/attendance/records';
  const isReport = url.pathname === '/attendance/employee-report';
  if (!isRecords && !isReport) {
    return;
  }
  const fromDate = url.searchParams.get('fromDate') ?? '';
  const toDate = url.searchParams.get('toDate') ?? '';
  if (!DATE_PATTERN.test(fromDate) || !DATE_PATTERN.test(toDate)) {
    throw new Error(
      `Refusing ${path} without valid fromDate and toDate (would load unbounded punches)`,
    );
  }

  const entry: DatedAttendanceLog = {
    at: new Date().toISOString(),
    path: url.pathname,
    fromDate,
    toDate,
  };
  datedAttendanceRequestLog.push(entry);
  console.log(`[attendance] ${url.pathname} fromDate=${fromDate} toDate=${toDate}`);
}
