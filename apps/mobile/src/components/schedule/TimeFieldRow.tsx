import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatWallClockTime12h } from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { WallClockTimePickerModal } from './WallClockTimePickerModal';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  errorKey?: string;
  errorMessage?: string;
};

export function TimeFieldRow({
  label,
  value,
  onChange,
  errorKey,
  errorMessage,
}: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const displayTime = formatWallClockTime12h(
    value,
    t('settings.timeAm'),
    t('settings.timePm'),
  );
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <>
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.field, mirroredRow(mirrorLayout)]}
          onPress={() => setOpen(true)}
        >
          <Text style={[styles.value, ltrText]}>{displayTime}</Text>
        </Pressable>
        {errorMessage ? (
          <Text style={styles.error} accessibilityLabel={errorKey}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <WallClockTimePickerModal
        visible={open}
        title={label}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const border = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    wrap: { gap: 6, marginBottom: 10 },
    label: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    field: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: border,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.5)',
    },
    value: {
      fontFamily: typography.inter.bold,
      fontSize: 18,
      color: text,
      fontVariant: ['tabular-nums'],
    },
    error: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: '#EF4444',
    },
  });
}
