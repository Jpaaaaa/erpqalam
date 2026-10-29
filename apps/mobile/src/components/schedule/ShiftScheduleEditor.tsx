import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ShiftScheduleForm, ShiftScheduleFormUpdater } from '../../attendance/scheduleModel';
import type { ScheduleValidationErrors } from '../../attendance/scheduleValidation';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ShiftTimelineBar } from './ShiftTimelineBar';
import { TimeFieldRow } from './TimeFieldRow';
import { WorkingDayPills } from './WorkingDayPills';

type Props = {
  value: ShiftScheduleForm;
  onChange: (next: ShiftScheduleFormUpdater) => void;
  errors: ScheduleValidationErrors;
  disabled?: boolean;
};

export function ShiftScheduleEditor({ value, onChange, errors, disabled }: Props) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  function err(key: keyof ShiftScheduleForm): string | undefined {
    if (key === 'workingDays') {
      return errors.form ? t(`settings.validation.${errors.form}`) : undefined;
    }
    const code = errors[key];
    return code ? t(`settings.validation.${code}`) : undefined;
  }

  function patch(partial: Partial<ShiftScheduleForm>) {
    onChange((prev) => ({ ...prev, ...partial }));
  }

  function timeRow(
    key: Exclude<keyof ShiftScheduleForm, 'workingDays'>,
    labelKey: string,
  ) {
    return (
      <TimeFieldRow
        key={key}
        label={t(labelKey)}
        value={value[key]}
        onChange={(v) => patch({ [key]: v })}
        errorKey={key}
        errorMessage={err(key)}
      />
    );
  }

  return (
    <View style={styles.stack}>
      <HomeGlassCard>
        <Text style={styles.sectionTitle}>{t('settings.shiftSection')}</Text>
        {timeRow('shiftStartTime', 'settings.shiftStart')}
        {timeRow('shiftEndTime', 'settings.shiftEnd')}
      </HomeGlassCard>

      <HomeGlassCard>
        <Text style={styles.sectionTitle}>{t('settings.zonesSection')}</Text>
        <ShiftTimelineBar schedule={value} />
        <Text style={styles.zoneGroup}>{t('settings.zoneEntry')}</Text>
        {timeRow('entryZoneStart', 'settings.entryStart')}
        {timeRow('entryZoneEnd', 'settings.entryEnd')}
        <Text style={styles.zoneGroup}>{t('settings.zoneLate')}</Text>
        {timeRow('lateZoneStartTime', 'settings.lateStart')}
        {timeRow('lateZoneEndTime', 'settings.lateEnd')}
        <Text style={styles.zoneGroup}>{t('settings.zoneExit')}</Text>
        {timeRow('exitZoneStart', 'settings.exitStart')}
        {timeRow('exitZoneEnd', 'settings.exitEnd')}
        <Text style={styles.zoneGroup}>{t('settings.zoneEarly')}</Text>
        {timeRow('earlyLeftZoneStartTime', 'settings.earlyStart')}
        {timeRow('earlyLeftZoneEndTime', 'settings.earlyEnd')}
      </HomeGlassCard>

      <HomeGlassCard>
        <Text style={styles.sectionTitle}>{t('settings.workingDaysSection')}</Text>
        <WorkingDayPills
          value={value.workingDays}
          onChange={(days) => patch({ workingDays: days })}
          disabled={disabled}
        />
        {err('workingDays') ? (
          <Text style={styles.formError}>{err('workingDays')}</Text>
        ) : null}
      </HomeGlassCard>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

  return StyleSheet.create({
    stack: { gap: 16 },
    sectionTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
      marginBottom: 12,
    },
    zoneGroup: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 4,
      marginBottom: 2,
    },
    formError: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: '#EF4444',
      marginTop: 8,
    },
  });
}
