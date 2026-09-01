import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceEmployeesPanel } from '@/components/attendance/AttendanceEmployeesPanel';

export default function AttendanceEmployeesPage() {
  return (
    <AttendancePanel>
      <AttendanceEmployeesPanel />
    </AttendancePanel>
  );
}
