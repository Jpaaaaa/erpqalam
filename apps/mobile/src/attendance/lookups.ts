import type { AttendanceDevice, AttendanceUser } from '../types/attendance';

export function buildNameLookup(users: AttendanceUser[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const user of users) {
    map.set(user.deviceUserId, user.name.trim() || user.deviceUserId);
  }
  return map;
}

export function buildDeviceNameLookup(
  devices: AttendanceDevice[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const device of devices) {
    map.set(device.serialNumber, device.name.trim() || device.serialNumber);
  }
  return map;
}
