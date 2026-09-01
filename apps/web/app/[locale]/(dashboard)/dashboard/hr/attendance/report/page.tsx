import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { EmployeeReportPanel } from '@/components/attendance/EmployeeReportPanel';

export default function AttendanceReportPage() {
  return (
    <AttendancePanel>
      <EmployeeReportPanel />
    </AttendancePanel>
  );
}
