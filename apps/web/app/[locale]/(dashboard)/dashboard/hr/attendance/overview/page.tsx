import { AttendancePanel } from '@/components/attendance/AttendancePanel';
import { AttendanceOverviewPanel } from '@/components/attendance/AttendanceOverviewPanel';

export default function AttendanceOverviewPage() {
  return (
    <AttendancePanel>
      <AttendanceOverviewPanel />
    </AttendancePanel>
  );
}
