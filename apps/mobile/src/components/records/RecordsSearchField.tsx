import { useMemo } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
  GLASS_MUTED_DARK,
  GLASS_MUTED_LIGHT,
} from '../home/homeGlass';

export function RecordsSearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const fill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const iconColor = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;

  return (
    <View
      style={[
        styles.shell,
        mirroredRow(mirrorLayout),
        { backgroundColor: fill, borderColor: border },
      ]}
    >
      <Ionicons name="search-outline" size={20} color={iconColor} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

  return StyleSheet.create({
    shell: {
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 10,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    icon: { flexShrink: 0 },
    input: {
      flex: 1,
      fontFamily: typography.noto.medium,
      fontSize: 15,
      lineHeight: 22,
      color: text,
      paddingVertical: 0,
      backgroundColor: 'transparent',
    },
  });
}
