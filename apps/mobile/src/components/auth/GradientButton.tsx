import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_GRADIENT, brandShadow } from '../../theme/brand';
import { AppText } from '../../ui/AppText';

export function GradientButton({
  children,
  isLoading,
  loadingLabel,
  style,
  disabled,
  ...rest
}: Omit<PressableProps, 'children'> & {
  children: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      {...rest}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.wrap,
        brandShadow,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[...BRAND_GRADIENT]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.label}>{children}</AppText>
        )}
        {isLoading && loadingLabel ? (
          <AppText style={styles.loadingHint}>{loadingLabel}</AppText>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: 'hidden' },
  gradient: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loadingHint: { display: 'none' },
  pressed: { opacity: 0.95 },
  disabled: { opacity: 0.6 },
});
