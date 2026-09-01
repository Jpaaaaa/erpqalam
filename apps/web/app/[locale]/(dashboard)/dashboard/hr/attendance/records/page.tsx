import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceRecordsPanel } from '@/components/attendance/AttendanceRecordsPanel';

export default function AttendanceRecordsPage() {
  return (
    <AttendancePanel>
      <AttendanceRecordsPanel />
    </AttendancePanel>
  );
}
