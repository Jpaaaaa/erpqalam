import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';

export function EmployeeDetailBottomActions({
  canManage,
  onFullReport,
  onManualPunch,
}: {
  canManage: boolean;
  onFullReport: () => void;
  onManualPunch: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const fill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles.glass,
          { backgroundColor: fill, borderColor: border },
          pressed && styles.pressed,
        ]}
        onPress={onFullReport}
      >
        <Text
          style={[
            styles.glassText,
            {
              fontFamily: typography.noto.bold,
              color: isDark ? '#F1F5F9' : '#0F172A',
            },
          ]}
        >
          {t('employeeDetail.fullReport')}
        </Text>
      </Pressable>
      {canManage ? (
        <Pressable
          style={({ pressed }) => [styles.btn, styles.teal, pressed && styles.pressed]}
          onPress={onManualPunch}
        >
          <Text style={[styles.tealText, { fontFamily: typography.noto.bold }]}>
            {t('employeeDetail.manualPunch')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
  },
  glass: { borderWidth: 1 },
  teal: { backgroundColor: '#14B8A6' },
  glassText: { fontSize: 14 },
  tealText: { fontSize: 14, color: '#FFFFFF' },
  pressed: { opacity: 0.9 },
});
