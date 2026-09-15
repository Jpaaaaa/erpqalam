import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../ui/AppText';

export function GoogleSignInButton({
  label,
  onPress,
  disabled,
  isLoading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        (disabled || isLoading) && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#334155" />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color="#4285F4" />
          <AppText style={styles.label}>{label}</AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#334155' },
  pressed: { backgroundColor: '#f8fafc' },
  disabled: { opacity: 0.6 },
});
