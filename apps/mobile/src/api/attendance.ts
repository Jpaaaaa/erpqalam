import { apiRequest } from './client';
import type {
  AttendanceDevice,
  AttendanceRecord,
  AttendanceUser,
  EmployeeReport,
} from '../types/attendance';

export async function listAttendanceUsers(): Promise<AttendanceUser[]> {
  return apiRequest<AttendanceUser[]>('/attendance/users');
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
