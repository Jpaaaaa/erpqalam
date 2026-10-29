import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n/I18nProvider';
import { dateStepChevron } from '../../ui/chevronIcons';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';
import { useHomeTheme } from '../../theme/HomeThemeProvider';

const SIZE = 40;

export function GlassBackButton({ onPress }: { onPress: () => void }) {
  const { mirrorLayout, isRtl } = useI18n();
  const { isDark } = useHomeTheme();
  const rtl = isRtl || mirrorLayout;
  const fill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: fill, borderColor: border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Ionicons
        name={dateStepChevron('prev', rtl)}
        size={22}
        color={isDark ? '#94A3B8' : '#64748B'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
  },
  pressed: { opacity: 0.88 },
});
