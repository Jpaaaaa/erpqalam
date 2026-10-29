import type { AttendanceDevice } from '../types/attendance';
import {
  buildNameLookup as buildNameLookupFromEmployees,
  mergeEmployeesWithPunchIds,
} from './employees';

export { mergeEmployeesWithPunchIds, buildNameLookupFromEmployees as buildNameLookup };

export function buildDeviceNameLookup(
  devices: AttendanceDevice[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const device of devices) {
    map.set(device.serialNumber, device.name.trim() || device.serialNumber);
  }
  return map;
}
