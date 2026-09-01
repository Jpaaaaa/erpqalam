import type { AttendanceRecord, AttendanceUser, MergedAttendanceEmployee } from '@/lib/types/attendance';

export function mergeEmployeesWithPunchIds(
  users: AttendanceUser[],
  records: AttendanceRecord[],
): MergedAttendanceEmployee[] {
  const registeredIds = new Set(users.map((u) => u.deviceUserId));
  const punchOnlyIds = Array.from(
    new Set(
      records
        .map((r) => r.deviceUserId)
        .filter((id) => !registeredIds.has(id)),
    ),
  );

  const merged: MergedAttendanceEmployee[] = users.map((u) => ({
    ...u,
    isUnregistered: false,
  }));

  for (const deviceUserId of punchOnlyIds) {
    merged.push({
      id: '',
      deviceUserId,
      name: '',
      isUnregistered: true,
    });
  }

  return merged.sort((a, b) =>
    a.deviceUserId.localeCompare(b.deviceUserId, undefined, { numeric: true }),
  );
}

export function buildNameLookup(
  employees: MergedAttendanceEmployee[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of employees) {
    map.set(e.deviceUserId, e.name.trim() || e.deviceUserId);
  }
  return map;
}
