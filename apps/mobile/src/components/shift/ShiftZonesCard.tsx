import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ShiftScheduleForm, ShiftScheduleFormUpdater } from '../../attendance/scheduleModel';
import { formatWallClockTime12h } from '../../attendance/wallClockTime';
import type { ScheduleValidationErrors } from '../../attendance/scheduleValidation';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { TimeFieldRow } from '../schedule/TimeFieldRow';

type Props = {
  value: ShiftScheduleForm;
  onChange: (next: ShiftScheduleFormUpdater) => void;
  errors: ScheduleValidationErrors;
  readOnly?: boolean;
};

export function ShiftZonesCard({ value, onChange, errors, readOnly }: Props) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  function patch(partial: Partial<ShiftScheduleForm>) {
    onChange((prev) => ({ ...prev, ...partial }));
  }

  function err(key: keyof ShiftScheduleForm): string | undefined {
    if (key === 'workingDays') return undefined;
    const code = errors[key];
    return code ? t(`settings.validation.${code}`) : undefined;
  }

  function row(
    key: Exclude<keyof ShiftScheduleForm, 'workingDays'>,
    labelKey: string,
  ) {
    if (readOnly) {
      return (
        <View key={key} style={styles.readRow}>
          <Text style={styles.readLabel}>{t(labelKey)}</Text>
          <Text style={[styles.readValue, ltrText]}>
            {formatWallClockTime12h(value[key], t('settings.timeAm'), t('settings.timePm'))}
          </Text>
        </View>
      );
    }
    return (
      <TimeFieldRow
        key={key}
        label={t(labelKey)}
        value={value[key]}
        onChange={(v) => patch({ [key]: v })}
        errorMessage={err(key)}
      />
    );
  }

  return (
    <HomeGlassCard>
      <Text style={styles.title}>{t('settings.zonesSection')}</Text>
      <Text style={styles.group}>{t('settings.shiftSection')}</Text>
      {row('shiftStartTime', 'settings.shiftStart')}
      {row('shiftEndTime', 'settings.shiftEnd')}
      <Text style={styles.group}>{t('settings.zoneEntry')}</Text>
      {row('entryZoneStart', 'settings.entryStart')}
      {row('entryZoneEnd', 'settings.entryEnd')}
      <Text style={styles.group}>{t('settings.zoneLate')}</Text>
      {row('lateZoneStartTime', 'settings.lateStart')}
      {row('lateZoneEndTime', 'settings.lateEnd')}
      <Text style={styles.group}>{t('settings.zoneExit')}</Text>
      {row('exitZoneStart', 'settings.exitStart')}
      {row('exitZoneEnd', 'settings.exitEnd')}
      <Text style={styles.group}>{t('settings.zoneEarly')}</Text>
      {row('earlyLeftZoneStartTime', 'settings.earlyStart')}
      {row('earlyLeftZoneEndTime', 'settings.earlyEnd')}
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  return StyleSheet.create({
    title: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
      marginBottom: 8,
    },
    group: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 8,
      marginBottom: 4,
    },
    readRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.06)',
    },
    readLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: text,
      flex: 1,
    },
    readValue: {
      fontFamily: typography.inter.bold,
      fontSize: 16,
      color: text,
      fontVariant: ['tabular-nums'],
    },
  });
}
