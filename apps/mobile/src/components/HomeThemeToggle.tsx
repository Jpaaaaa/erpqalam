import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import type { HomeThemePreference } from '../theme/homeTheme';
import { AppText } from '../ui/AppText';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';

const OPTIONS: HomeThemePreference[] = ['light', 'dark', 'system'];

const LABEL: Record<HomeThemePreference, string> = {
  light: 'more.themeLight',
  dark: 'more.themeDark',
  system: 'more.themeSystem',
};

export function HomeThemeToggle() {
  const { t } = useTranslation('attendance');
  const { preference, setPreference } = useHomeTheme();
  const { mirrorLayout } = useI18n();

  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{t('more.theme')}</AppText>
      <View style={[styles.row, mirroredRow(mirrorLayout)]}>
        {OPTIONS.map((opt) => {
          const active = preference === opt;
          return (
            <Pressable
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => void setPreference(opt)}
            >
              <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                {t(LABEL[opt])}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#CCFBF1',
    borderColor: '#14B8A6',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#0F766E' },
});
