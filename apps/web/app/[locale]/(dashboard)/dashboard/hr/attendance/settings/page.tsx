import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceDevicesPanel } from '@/components/attendance/AttendanceDevicesPanel';
import { AttendanceSettingsForm } from '@/components/attendance/AttendanceSettingsForm';

export default function AttendanceSettingsPage() {
  return (
    <AttendancePanel>
      <div className="space-y-6">
        <AttendanceDevicesPanel />
        <AttendanceSettingsForm />
      </div>
    </AttendancePanel>
  );
}
