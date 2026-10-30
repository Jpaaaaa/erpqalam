import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { displayName } from '../attendance/formatters';
import type { AttendanceUser } from '../types/attendance';
import { EmployeeSelectSheet } from './EmployeeSelectSheet';
import { AppText } from '../ui/AppText';

export function EmployeePicker({
  users,
  value,
  onChange,
}: {
  users: AttendanceUser[];
  value: string;
  onChange: (deviceUserId: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const [open, setOpen] = useState(false);

  const selected = users.find((u) => u.deviceUserId === value);

  return (
    <>
      <AppText style={styles.label}>{t('report.selectEmployee')}</AppText>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <AppText style={styles.triggerText} numberOfLines={1}>
          {selected
            ? displayName(selected.name, selected.deviceUserId)
            : t('report.selectEmployeePlaceholder')}
        </AppText>
      </Pressable>

      <EmployeeSelectSheet
        visible={open}
        users={users}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  trigger: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  triggerText: { fontSize: 16, color: '#0f172a' },
});
