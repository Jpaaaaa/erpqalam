import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { displayName } from '../../attendance/formatters';
import type { AttendanceUser, LeaveBalance } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { HolidaysStepper } from './HolidaysStepper';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
} from '../home/homeGlass';

export function HolidaysSettingsCard({
  annualDays,
  tempRatio,
  onAnnualChange,
  onTempRatioChange,
  onSaveConfig,
  canManage,
  balances,
  users,
  nameLookup,
  onSetBalance,
}: {
  annualDays: number;
  tempRatio: number;
  onAnnualChange: (v: number) => void;
  onTempRatioChange: (v: number) => void;
  onSaveConfig: () => void;
  canManage: boolean;
  balances: LeaveBalance[];
  users: AttendanceUser[];
  nameLookup: Map<string, string>;
  onSetBalance: (deviceUserId: string, days: number) => void;
}) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const balanceRows = useMemo(() => {
    const map = new Map(balances.map((b) => [b.deviceUserId, b.balanceDays]));
    return users.map((u) => ({
      deviceUserId: u.deviceUserId,
      name: displayName(u.name, u.deviceUserId),
      days: map.get(u.deviceUserId) ?? 0,
    }));
  }, [balances, users, nameLookup]);

  return (
    <View style={styles.wrap}>
      <HomeGlassCard padding={16}>
        <Text style={styles.sectionTitle}>{t('holidays.leaveConfig')}</Text>
        <HolidaysStepper
          label={t('holidays.annualDays')}
          value={annualDays}
          onChange={onAnnualChange}
          min={0}
          max={365}
          disabled={!canManage}
        />
        <HolidaysStepper
          label={t('holidays.tempRatio')}
          value={tempRatio}
          onChange={onTempRatioChange}
          min={1}
          max={30}
          disabled={!canManage}
        />
        {canManage ? (
          <Pressable
            style={[styles.saveBtn, { backgroundColor: palette.teal }]}
            onPress={onSaveConfig}
          >
            <Text style={styles.saveText}>{t('holidays.saveConfig')}</Text>
          </Pressable>
        ) : null}
      </HomeGlassCard>

      <HomeGlassCard padding={0}>
        <Text style={[styles.sectionTitle, styles.sectionPad]}>
          {t('holidays.leaveBalances')}
        </Text>
        {balanceRows.length === 0 ? (
          <Text style={styles.mutedPad}>{t('holidays.noBalances')}</Text>
        ) : (
          balanceRows.map((row, index) => (
            <View
              key={row.deviceUserId}
              style={[
                styles.balanceRow,
                index < balanceRows.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,
                },
              ]}
            >
              <Text style={styles.balanceName} numberOfLines={1}>
                {row.name}
              </Text>
              <View style={styles.stepperWrap}>
                <HolidaysStepper
                  label=" "
                  value={Math.round(row.days)}
                  onChange={(v) => onSetBalance(row.deviceUserId, v)}
                  min={0}
                  max={365}
                  disabled={!canManage}
                />
              </View>
            </View>
          ))
        )}
      </HomeGlassCard>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    wrap: { gap: 16 },
    sectionTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: text,
      marginBottom: 8,
    },
    sectionPad: { paddingHorizontal: 16, paddingTop: 16 },
    mutedPad: {
      padding: 16,
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: muted,
    },
    saveBtn: {
      marginTop: 12,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveText: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: '#FFFFFF',
    },
    balanceRow: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 4,
    },
    balanceName: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
    },
    stepperWrap: { marginTop: -4 },
  });
}
