import { TurboModuleRegistry } from 'react-native';

let cached: boolean | null = null;

/** True after a dev client / release build that includes @react-native-community/datetimepicker. */
export function isRNCDatePickerAvailable(): boolean {
  if (cached != null) return cached;
  cached = TurboModuleRegistry.get('RNCDatePicker') != null;
  return cached;
}
