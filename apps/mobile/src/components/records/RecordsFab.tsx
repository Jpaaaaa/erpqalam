import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from '../../theme/homeTheme';
import { useI18n } from '../../i18n/I18nProvider';

const SIZE = 56;

export function RecordsFab({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const { mirrorLayout } = useI18n();
  const bottom = FLOATING_TAB_BAR_TOTAL_HEIGHT + insets.bottom + 16;

  return (
    <View
      style={[
        styles.host,
        { bottom },
        mirrorLayout ? styles.hostRtl : styles.hostLtr,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    zIndex: 20,
  },
  hostLtr: { right: 20 },
  hostRtl: { left: 20 },
  fab: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.96 }] },
});
