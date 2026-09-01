import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceHolidaysPanel } from '@/components/attendance/AttendanceHolidaysPanel';

export default function AttendanceHolidaysPage() {
  return (
    <AttendancePanel>
      <AttendanceHolidaysPanel />
    </AttendancePanel>
  );
}
