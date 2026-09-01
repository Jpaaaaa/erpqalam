import { apiRequest, ApiClientError, API_BASE_URL } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/storage';
import type {
  ApiSuccess,
  AttendanceDevice,
  AttendanceHoliday,
  AttendanceHolidayType,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  EmployeeHoliday,
  EmployeeReport,
  LeaveBalance,
  TimeLeaveType,
  TimeLeaveUsage,
} from '@/lib/types/attendance';

export { ApiClientError };

export async function listAttendanceRecords(params?: {
  fromDate?: string;
  toDate?: string;
  deviceUserId?: string;
  limit?: number;
}): Promise<AttendanceRecord[]> {
  const search = new URLSearchParams();
  if (params?.fromDate) search.set('fromDate', params.fromDate);
  if (params?.toDate) search.set('toDate', params.toDate);
  if (params?.deviceUserId) search.set('deviceUserId', params.deviceUserId);
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiRequest<AttendanceRecord[]>(
    `/attendance/records${query ? `?${query}` : ''}`,
  );
}

export async function addManualPunch(payload: {
  deviceUserId: string;
  timestamp: string;
  punchKind?: 'in' | 'out';
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/records/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAttendanceUsers(): Promise<AttendanceUser[]> {
  return apiRequest<AttendanceUser[]>('/attendance/users');
}

export async function createAttendanceUser(payload: {
  deviceUserId: string;
  name?: string;
}): Promise<AttendanceUser> {
  return apiRequest<AttendanceUser>('/attendance/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function bulkImportAttendanceUsers(
  users: { deviceUserId: string; name?: string }[],
): Promise<{ created: number; updated: number; skipped: number }> {
  return apiRequest<{ created: number; updated: number; skipped: number }>(
    '/attendance/users/bulk',
    {
      method: 'POST',
      body: JSON.stringify({ users }),
    },
  );
}

export async function updateAttendanceUser(
  deviceUserId: string,
  payload: Partial<
    Omit<AttendanceUser, 'id' | 'deviceUserId' | 'linkedUserId'>
  > & { linkedUserId?: string | null },
): Promise<AttendanceUser> {
  return apiRequest<AttendanceUser>(
    `/attendance/users/${encodeURIComponent(deviceUserId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAttendanceUser(
  deviceUserId: string,
): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>(
    `/attendance/users/${encodeURIComponent(deviceUserId)}`,
    { method: 'DELETE' },
  );
}

export async function listAttendanceDevices(): Promise<AttendanceDevice[]> {
  return apiRequest<AttendanceDevice[]>('/attendance/devices');
}

export async function updateAttendanceDevice(
  serialNumber: string,
  payload: { name?: string; isActive?: boolean },
): Promise<AttendanceDevice> {
  return apiRequest<AttendanceDevice>(
    `/attendance/devices/${encodeURIComponent(serialNumber)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  return apiRequest<AttendanceSettings>('/attendance/settings');
}

export async function updateAttendanceSettings(
  payload: Partial<AttendanceSettings>,
): Promise<AttendanceSettings> {
  return apiRequest<AttendanceSettings>('/attendance/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function listHolidays(): Promise<AttendanceHoliday[]> {
  return apiRequest<AttendanceHoliday[]>('/attendance/holidays');
}

export async function addHoliday(payload: {
  date: string;
  type: AttendanceHolidayType;
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/holidays', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addHolidayRange(payload: {
  dateFrom: string;
  dateTo: string;
  type: AttendanceHolidayType;
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/holidays/range', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeHoliday(id: string): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>(`/attendance/holidays/${id}`, {
    method: 'DELETE',
  });
}

export async function removeHolidays(ids: string[]): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/holidays', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function listEmployeeHolidays(): Promise<EmployeeHoliday[]> {
  return apiRequest<EmployeeHoliday[]>('/attendance/employee-holidays');
}

export async function addEmployeeHoliday(payload: {
  deviceUserId: string;
  date: string;
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/employee-holidays', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addEmployeeHolidayRange(payload: {
  deviceUserId: string;
  dateFrom: string;
  dateTo: string;
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/employee-holidays/range', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeEmployeeHoliday(id: string): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>(`/attendance/employee-holidays/${id}`, {
    method: 'DELETE',
  });
}

export async function removeEmployeeHolidays(ids: string[]): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/employee-holidays', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function listTimeLeaveUsage(): Promise<TimeLeaveUsage[]> {
  return apiRequest<TimeLeaveUsage[]>('/attendance/time-leave-usage');
}

export async function addTimeLeaveUsage(payload: {
  deviceUserId: string;
  date: string;
  timestamp: string;
  type: TimeLeaveType;
}): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>('/attendance/time-leave-usage', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeTimeLeaveUsage(id: string): Promise<ApiSuccess> {
  return apiRequest<ApiSuccess>(`/attendance/time-leave-usage/${id}`, {
    method: 'DELETE',
  });
}

export async function listLeaveBalances(): Promise<LeaveBalance[]> {
  return apiRequest<LeaveBalance[]>('/attendance/leave-balances');
}

export async function setLeaveBalance(
  deviceUserId: string,
  balanceDays: number,
): Promise<LeaveBalance> {
  return apiRequest<LeaveBalance>(
    `/attendance/leave-balances/${encodeURIComponent(deviceUserId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ balanceDays }),
    },
  );
}

export async function getEmployeeReport(params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<EmployeeReport> {
  const search = new URLSearchParams();
  if (params?.fromDate) search.set('fromDate', params.fromDate);
  if (params?.toDate) search.set('toDate', params.toDate);
  const query = search.toString();
  return apiRequest<EmployeeReport>(
    `/attendance/employee-report${query ? `?${query}` : ''}`,
  );
}

export type EmployeeReportPdfType = 'performance' | 'per-employee' | 'summary';

export async function downloadEmployeeReportPdf(params: {
  type: EmployeeReportPdfType;
  fromDate?: string;
  toDate?: string;
  deviceUserId?: string;
}): Promise<void> {
  const search = new URLSearchParams();
  search.set('type', params.type);
  if (params.fromDate) search.set('fromDate', params.fromDate);
  if (params.toDate) search.set('toDate', params.toDate);
  if (params.deviceUserId) search.set('deviceUserId', params.deviceUserId);

  const headers: HeadersInit = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE_URL}/attendance/employee-report/pdf?${search.toString()}`,
    { headers, cache: 'no-store' },
  );

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message || message;
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const fileName =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1] ||
    `attendance-report-${params.type}.pdf`;
  anchor.href = url;
  anchor.download = decodeURIComponent(fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
