import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';
import { useHomeTheme } from '../../theme/HomeThemeProvider';

const SIZE = 40;

export function GlassCircleIconButton({
  icon,
  onPress,
  disabled,
  loading,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}) {
  const { isDark, palette } = useHomeTheme();
  const fill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const iconColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: fill, borderColor: border },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.teal} />
      ) : (
        <Ionicons name={icon} size={20} color={iconColor} />
      )}
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
  disabled: { opacity: 0.55 },
});
