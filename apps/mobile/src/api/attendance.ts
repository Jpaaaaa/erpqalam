import { API_BASE_URL, apiRequest, ApiClientError } from './client';
import { getAccessToken } from '../auth/storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type {
  ApiSuccess,
  AttendanceDevice,
  AttendanceHoliday,
  AttendanceHolidayType,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  DailyReport,
  DailySummaryResponse,
  EmployeeHoliday,
  EmployeeReport,
  LeaveBalance,
  TimeLeaveType,
  TimeLeaveUsage,
} from '../types/attendance';

export async function listAttendanceUsers(): Promise<AttendanceUser[]> {
  return apiRequest<AttendanceUser[]>('/attendance/users');
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

export async function listAttendanceDevices(): Promise<AttendanceDevice[]> {
  return apiRequest<AttendanceDevice[]>('/attendance/devices');
}

export async function listAttendanceRecords(params: {
  fromDate: string;
  toDate: string;
  deviceUserId?: string;
  limit: number;
}): Promise<AttendanceRecord[]> {
  const search = new URLSearchParams();
  search.set('fromDate', params.fromDate);
  search.set('toDate', params.toDate);
  search.set('limit', String(params.limit));
  if (params.deviceUserId) search.set('deviceUserId', params.deviceUserId);
  return apiRequest<AttendanceRecord[]>(`/attendance/records?${search.toString()}`);
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

export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  return apiRequest<AttendanceSettings>('/attendance/settings');
}

export async function getDailyReport(date: string): Promise<DailyReport> {
  const search = new URLSearchParams();
  search.set('date', date);
  return apiRequest<DailyReport>(`/attendance/daily-report?${search.toString()}`);
}

export async function getDailySummaries(params: {
  fromDate: string;
  toDate: string;
}): Promise<DailySummaryResponse> {
  const search = new URLSearchParams();
  search.set('fromDate', params.fromDate);
  search.set('toDate', params.toDate);
  return apiRequest<DailySummaryResponse>(
    `/attendance/daily-summary?${search.toString()}`,
  );
}

export async function updateAttendanceSettings(
  payload: Partial<AttendanceSettings>,
): Promise<AttendanceSettings> {
  return apiRequest<AttendanceSettings>('/attendance/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
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

export async function getEmployeeReport(params: {
  fromDate: string;
  toDate: string;
}): Promise<EmployeeReport> {
  const search = new URLSearchParams();
  search.set('fromDate', params.fromDate);
  search.set('toDate', params.toDate);
  return apiRequest<EmployeeReport>(
    `/attendance/employee-report?${search.toString()}`,
  );
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

export type EmployeeReportPdfType =
  | 'performance'
  | 'per-employee'
  | 'summary'
  | 'daily';

export async function shareAttendanceReportPdf(params: {
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

  const token = await getAccessToken();
  const url = `${API_BASE_URL}/attendance/employee-report/pdf?${search.toString()}`;
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new ApiClientError('File cache is unavailable on this device.', 0);
  }
  const fileUri = `${cacheDir}attendance-${params.type}-${Date.now()}.pdf`;

  const result = await FileSystem.downloadAsync(url, fileUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (result.status < 200 || result.status >= 300) {
    throw new ApiClientError(
      `PDF download failed (${result.status})`,
      result.status,
    );
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new ApiClientError('Sharing is not available on this device.', 0);
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
  });
}
