import { useAuth } from '../auth/context';
import { canManageAttendance } from '../permissions';

export function useCanManageAttendance(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return canManageAttendance(user.role, user.permissions);
}
