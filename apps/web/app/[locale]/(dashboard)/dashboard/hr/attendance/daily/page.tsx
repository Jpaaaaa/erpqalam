import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceDailyPanel } from '@/components/attendance/AttendanceDailyPanel';

export default function AttendanceDailyPage() {
  return (
    <AttendancePanel>
      <AttendanceDailyPanel />
    </AttendancePanel>
  );
}
