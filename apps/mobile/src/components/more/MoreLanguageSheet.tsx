import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { APP_LOCALES, type AppLocale } from '../../i18n/locales';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FALLBACK_DARK,
  GLASS_FALLBACK_LIGHT,
  GLASS_RADIUS,
} from '../home/homeGlass';
import { mirroredRow } from '../../ui/rtlLayout';

const LABELS: Record<AppLocale, 'langKurdish' | 'langArabic' | 'langEnglish'> = {
  ku: 'langKurdish',
  ar: 'langArabic',
  en: 'langEnglish',
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function MoreLanguageSheet({ visible, onClose }: Props) {
  const { t } = useTranslation(['mobile', 'common']);
  const { locale, setLocale, mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.sheetTitle}>{t('common:language')}</Text>
          {APP_LOCALES.map((code, index) => {
            const active = code === locale;
            const isLast = index === APP_LOCALES.length - 1;
            return (
              <Pressable
                key={code}
                style={[
                  styles.option,
                  mirroredRow(mirrorLayout),
                  !isLast && styles.optionBorder,
                ]}
                onPress={() => {
                  void setLocale(code);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {t(`mobile:${LABELS[code]}`)}
                </Text>
                {active ? (
                  <Ionicons name="checkmark" size={22} color={palette.teal} />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const sheetBg = isDark ? GLASS_FALLBACK_DARK : GLASS_FALLBACK_LIGHT;
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    sheet: {
      borderTopLeftRadius: GLASS_RADIUS,
      borderTopRightRadius: GLASS_RADIUS,
      paddingTop: 20,
      paddingBottom: 28,
      paddingHorizontal: 20,
      backgroundColor: sheetBg,
      borderWidth: 1,
      borderColor: border,
      borderBottomWidth: 0,
    },
    sheetTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 17,
      color: text,
      marginBottom: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      gap: 12,
    },
    optionBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
    },
    optionLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 16,
      color: text,
      flex: 1,
    },
    optionLabelActive: { color: teal },
  });
}
