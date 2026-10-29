import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { displayName } from '../attendance/formatters';
import type { AttendanceUser } from '../types/attendance';
import { SearchField } from './SearchField';
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
  const [search, setSearch] = useState('');

  const selected = users.find((u) => u.deviceUserId === value);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.deviceUserId.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q),
    );
  }, [users, search]);

  return (
    <>
      <AppText style={styles.label}>{t('report.selectEmployee')}</AppText>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <AppText style={styles.triggerText}>
          {selected
            ? displayName(selected.name, selected.deviceUserId)
            : t('report.selectEmployeePlaceholder')}
        </AppText>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{t('report.selectEmployee')}</AppText>
            <Pressable onPress={() => setOpen(false)}>
              <AppText style={styles.close}>{t('records.cancel')}</AppText>
            </Pressable>
          </View>
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder={t('report.searchPlaceholder')}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.deviceUserId}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item.deviceUserId);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <AppText style={styles.rowName} numberOfLines={1}>
                  {displayName(item.name, item.deviceUserId)}
                </AppText>
                <AppText style={styles.rowId}>{item.deviceUserId}</AppText>
              </Pressable>
            )}
            ListEmptyComponent={
              <AppText style={styles.empty}>{t('employees.empty')}</AppText>
            }
          />
        </View>
      </Modal>
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
  modal: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  close: { color: '#0f766e', fontWeight: '600', fontSize: 16 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  rowId: { fontSize: 12, color: '#64748b', marginTop: 2 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24 },
});
