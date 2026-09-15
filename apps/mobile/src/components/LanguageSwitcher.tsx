import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../i18n/I18nProvider';
import { APP_LOCALES, type AppLocale } from '../i18n/locales';
import { AppText } from '../ui/AppText';
import { mirroredRow } from '../ui/rtlLayout';

const LABELS: Record<AppLocale, 'langKurdish' | 'langArabic' | 'langEnglish'> = {
  ku: 'langKurdish',
  ar: 'langArabic',
  en: 'langEnglish',
};

export function LanguageSwitcher() {
  const { locale, setLocale, mirrorLayout } = useI18n();
  const { t } = useTranslation('mobile');

  return (
    <View style={[styles.row, mirroredRow(mirrorLayout)]}>
      {APP_LOCALES.map((code) => {
        const active = code === locale;
        return (
          <Pressable
            key={code}
            onPress={() => void setLocale(code)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <AppText style={[styles.label, active && styles.labelActive]}>
              {t(LABELS[code])}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
  },
  chipActive: { backgroundColor: '#ccfbf1' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569' },
  labelActive: { color: '#0f766e' },
});
