import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { displayName } from '../../attendance/formatters';
import type { AttendanceUser } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { EmployeeSelectSheet } from '../EmployeeSelectSheet';
import { HomeGlassCard } from '../home/HomeGlassCard';
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

  const selected = users.find((u) => u.deviceUserId === value);
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

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

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
    chevron: { color: isDark ? '#94A3B8' : '#64748B' },
  });
}
