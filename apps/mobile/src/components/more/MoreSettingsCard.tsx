import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { APP_LOCALES, type AppLocale } from '../../i18n/locales';
import { mirroredRow } from '../../ui/rtlLayout';
import { rowChevron } from '../../ui/chevronIcons';
import { HomeGlassCard } from '../home/HomeGlassCard';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
} from '../home/homeGlass';
import { MoreThemeSegment } from './MoreThemeSegment';

const LOCALE_LABEL: Record<AppLocale, 'langKurdish' | 'langArabic' | 'langEnglish'> = {
  ku: 'langKurdish',
  ar: 'langArabic',
  en: 'langEnglish',
};

type Props = {
  onOpenLanguage: () => void;
};

export function MoreSettingsCard({ onOpenLanguage }: Props) {
  const { t } = useTranslation(['attendance', 'mobile', 'common']);
  const { isDark, palette } = useHomeTheme();
  const { locale, mirrorLayout, typography, isRtl } = useI18n();
  const rtl = isRtl || mirrorLayout;
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const dividerColor = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const chevron = isDark ? '#64748B' : '#94A3B8';

  return (
    <HomeGlassCard padding={0}>
      <Pressable
        onPress={onOpenLanguage}
        style={({ pressed }) => [
          styles.row,
          mirroredRow(mirrorLayout),
          styles.rowBorder,
          { borderBottomColor: dividerColor },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
      >
        <View style={[styles.iconTile, styles.langTile]}>
          <Ionicons name="language-outline" size={20} color={palette.blue} />
        </View>
        <Text style={styles.label}>{t('common:language')}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {t(`mobile:${LOCALE_LABEL[locale]}`)}
        </Text>
        <Ionicons name={rowChevron(rtl)} size={18} color={chevron} />
      </Pressable>

      <View style={[styles.themeRow, mirroredRow(mirrorLayout)]}>
        <View style={[styles.iconTile, styles.themeTile]}>
          <Ionicons name="color-palette-outline" size={20} color={palette.purple} />
        </View>
        <Text style={[styles.label, styles.themeLabel]} numberOfLines={1}>
          {t('attendance:more.appearance')}
        </Text>
        <MoreThemeSegment />
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 56,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexWrap: 'wrap',
    },
    pressed: { opacity: 0.88 },
    iconTile: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    langTile: {
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.22)' : 'rgba(37, 99, 235, 0.12)',
    },
    themeTile: {
      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.12)',
    },
    label: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      color: text,
      flexShrink: 0,
    },
    themeLabel: {
      flex: 1,
      minWidth: 72,
    },
    value: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: muted,
      flexShrink: 1,
      maxWidth: '36%',
      textAlign: 'right',
    },
  });
}
