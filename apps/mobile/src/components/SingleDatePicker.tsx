import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate, isValidDateKey, shiftDateKey } from '../attendance/formatters';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { mirroredRow } from '../ui/rtlLayout';

export function SingleDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (dateKey: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, fontFamily } = useI18n();

  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.row, mirroredRow(mirrorLayout)]}>
        <Pressable
          accessibilityLabel={t('daily.prevDay')}
          onPress={() => onChange(shiftDateKey(value, -1))}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#0f766e" />
        </Pressable>
        <View style={styles.center}>
          <AppText style={styles.display}>{formatDisplayDate(value)}</AppText>
          <TextInput
            style={[styles.input, ltrText, fontFamily ? { fontFamily } : null]}
            value={value}
            onChangeText={(text) => {
              const trimmed = text.trim();
              if (isValidDateKey(trimmed)) onChange(trimmed);
            }}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Pressable
          accessibilityLabel={t('daily.nextDay')}
          onPress={() => onChange(shiftDateKey(value, 1))}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-forward" size={22} color="#0f766e" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  row: { alignItems: 'center', gap: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdfa',
  },
  center: { flex: 1, alignItems: 'center' },
  display: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    width: '100%',
    maxWidth: 160,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
});
