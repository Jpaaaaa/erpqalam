import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

export function HolidaysStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();

  return (
    <View style={[styles.row, mirroredRow(mirrorLayout)]}>
      <Text style={[styles.label, { fontFamily: typography.noto.medium, color: isDark ? '#E2E8F0' : '#0F172A' }]}>
        {label}
      </Text>
      <View style={[styles.controls, mirroredRow(mirrorLayout)]}>
        <Pressable
          disabled={disabled || value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[styles.btn, (disabled || value <= min) && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={[styles.value, ltrText, { fontFamily: typography.inter.bold }]}>
          {value}
        </Text>
        <Pressable
          disabled={disabled || value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[styles.btn, (disabled || value >= max) && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  label: { flex: 1, fontSize: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 20, fontWeight: '700', color: '#0F766E' },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
