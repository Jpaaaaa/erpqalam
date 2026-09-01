import type { AttendanceDevice } from '@/lib/types/attendance';

export function buildDeviceNameLookup(
  devices: AttendanceDevice[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const device of devices) {
    const label = device.name.trim() || device.serialNumber;
    map.set(device.serialNumber, label);
  }
  return map;
}

export function getDeviceDisplayName(
  serialNumber: string,
  lookup: Map<string, string>,
): string {
  return lookup.get(serialNumber) || serialNumber;
}
