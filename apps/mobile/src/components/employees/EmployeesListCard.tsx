import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { displayName, formatDisplayTime } from '../../attendance/formatters';
import type { DailyAttendanceRow, MergedAttendanceEmployee } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { rowChevron } from '../../ui/chevronIcons';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { avatarStyleForToday } from './employeeFilters';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

function statusPillColors(
  status: DailyAttendanceRow['status'] | 'unregistered' | undefined,
  isDark: boolean,
): { bg: string; ink: string } {
  switch (status) {
    case 'on_time':
      return {
        bg: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.14)',
        ink: '#0D9488',
      };
    case 'late':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.16)',
        ink: '#B45309',
      };
    case 'early_exit':
      return {
        bg: isDark ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.14)',
        ink: '#EA580C',
      };
    case 'absent':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)',
        ink: '#DC2626',
      };
    case 'on_leave':
      return {
        bg: isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(139, 92, 246, 0.14)',
        ink: '#7C3AED',
      };
    case 'unregistered':
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.16)',
        ink: isDark ? '#94A3B8' : '#64748B',
      };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.12)',
        ink: isDark ? '#94A3B8' : '#64748B',
      };
  }
}

export function EmployeesListCard({
  employees,
  rowsByDeviceId,
  onPressRow,
}: {
  employees: MergedAttendanceEmployee[];
  rowsByDeviceId: Map<string, DailyAttendanceRow>;
  onPressRow: (deviceUserId: string, name: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <HomeGlassCard padding={0}>
      <View style={GLASS_INNER_CONTENT}>
        {employees.map((employee, index) => {
          const todayRow = rowsByDeviceId.get(employee.deviceUserId);
          const isLast = index === employees.length - 1;
          return (
            <EmployeeRow
              key={employee.deviceUserId}
              employee={employee}
              todayRow={todayRow}
              isLast={isLast}
              mirrorLayout={mirrorLayout}
              styles={styles}
              typography={typography}
              t={t}
              onPress={() => {
                const name = employee.isUnregistered
                  ? t('employees.unregisteredLabel', { id: employee.deviceUserId })
                  : displayName(employee.name, employee.deviceUserId);
                onPressRow(employee.deviceUserId, name);
              }}
            />
          );
        })}
      </View>
    </HomeGlassCard>
  );
}

function EmployeeRow({
  employee,
  todayRow,
  isLast,
  mirrorLayout,
  styles,
  typography,
  t,
  onPress,
}: {
  employee: MergedAttendanceEmployee;
  todayRow?: DailyAttendanceRow;
  isLast: boolean;
  mirrorLayout: boolean;
  styles: ReturnType<typeof createStyles>;
  typography: AppTypography;
  t: (key: string, opts?: Record<string, string>) => string;
  onPress: () => void;
}) {
  const { isDark } = useHomeTheme();
  const avatar = avatarStyleForToday(employee, todayRow, isDark);
  const displayTitle = employee.isUnregistered
    ? t('employees.unregisteredLabel', { id: employee.deviceUserId })
    : (employee.name?.trim() || employee.deviceUserId);
  const initial = (displayTitle.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;

  const pillStatus = employee.isUnregistered
    ? ('unregistered' as const)
    : todayRow?.status;
  const pillColors = statusPillColors(pillStatus, isDark);
  const pillLabel = employee.isUnregistered
    ? t('employees.unregistered')
    : todayRow
      ? t(`daily.status.${todayRow.status}`)
      : t('daily.status.absent');

  const entryTime =
    todayRow?.entryTime && !employee.isUnregistered
      ? formatDisplayTime(todayRow.entryTime)
      : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        mirroredRow(mirrorLayout),
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: avatar.bg },
          avatar.dashed && styles.avatarDashed,
        ]}
      >
        <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: avatar.ink }]}>
          {employee.isUnregistered ? '?' : initial}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {displayTitle}
        </Text>
        <Text style={styles.subline} numberOfLines={1}>
          <Text style={styles.sublineMono}>#{employee.deviceUserId}</Text>
          {entryTime ? (
            <>
              <Text style={styles.subline}> · </Text>
              <Text style={styles.sublineMono}>{entryTime}</Text>
            </>
          ) : null}
        </Text>
      </View>

      <View style={[styles.end, mirroredRow(mirrorLayout)]}>
        <View style={[styles.pill, { backgroundColor: pillColors.bg }]}>
          <Text style={[styles.pillText, { color: pillColors.ink }]} numberOfLines={1}>
            {pillLabel}
          </Text>
        </View>
        <Ionicons
          name={rowChevron(mirrorLayout)}
          size={18}
          color={isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT}
        />
      </View>
    </Pressable>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    rowPressed: { opacity: 0.88 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarDashed: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: isDark ? '#64748B' : '#94A3B8',
    },
    avatarLetter: {
      fontSize: 16,
      lineHeight: 20,
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      lineHeight: 22,
      color: text,
    },
    subline: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      color: muted,
      marginTop: 2,
    },
    sublineMono: {
      fontFamily: typography.inter.bold,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    end: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
      maxWidth: 128,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      maxWidth: 96,
    },
    pillText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      lineHeight: 13,
      textAlign: 'center',
    },
  });
}
