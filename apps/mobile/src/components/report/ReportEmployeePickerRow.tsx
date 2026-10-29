import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { displayName } from '../../attendance/formatters';
import type { AttendanceUser } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { RecordsSearchField } from '../records/RecordsSearchField';
import { rowChevron } from '../../ui/chevronIcons';
import { mirroredRow } from '../../ui/rtlLayout';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function ReportEmployeePickerRow({
  users,
  value,
  onChange,
}: {
  users: AttendanceUser[];
  value: string;
  onChange: (deviceUserId: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, isRtl, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const rtl = isRtl || mirrorLayout;
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
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

  const title = selected
    ? displayName(selected.name, selected.deviceUserId)
    : t('report.selectEmployeePlaceholder');
  const initial = (title.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <HomeGlassCard padding={14}>
          <View style={[styles.row, mirroredRow(mirrorLayout)]}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
                {selected ? initial : '?'}
              </Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {title}
            </Text>
            <Ionicons name={rowChevron(rtl)} size={20} color={styles.chevron.color} />
          </View>
        </HomeGlassCard>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={[styles.modalHeader, mirroredRow(mirrorLayout)]}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {t('report.selectEmployee')}
            </Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={styles.close}>{t('records.cancel')}</Text>
            </Pressable>
          </View>
          <RecordsSearchField
            value={search}
            onChangeText={setSearch}
            placeholder={t('report.searchPlaceholder')}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.deviceUserId}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <Pressable
                style={styles.listRow}
                onPress={() => {
                  onChange(item.deviceUserId);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Text style={styles.rowName} numberOfLines={1}>
                  {displayName(item.name, item.deviceUserId)}
                </Text>
                <Text style={styles.rowId} numberOfLines={1}>
                  #{item.deviceUserId}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('employees.empty')}</Text>
            }
          />
        </View>
      </Modal>
    </>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const bg = isDark ? '#0F141A' : '#F4F6F8';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.28)' : 'rgba(20, 184, 166, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: { fontSize: 16, color: '#14B8A6' },
    name: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: text,
    },
    chevron: { color: muted },
    modal: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: bg, gap: 12 },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    modalTitle: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 18,
      color: text,
    },
    close: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: '#14B8A6',
    },
    listPad: { paddingTop: 8 },
    listRow: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(148,163,184,0.2)' : '#E2E8F0',
    },
    rowName: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
    },
    rowId: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
      marginTop: 2,
    },
    empty: {
      textAlign: 'center',
      color: muted,
      marginTop: 24,
      fontFamily: typography.noto.medium,
    },
  });
}
