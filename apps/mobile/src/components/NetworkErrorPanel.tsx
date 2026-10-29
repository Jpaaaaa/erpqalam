import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../ui/AppText';

export function NetworkErrorPanel({
  onRetry,
  message,
}: {
  onRetry: () => void;
  message?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <AppText style={styles.message}>{message ?? t('common:noConnection')}</AppText>
      <Pressable style={styles.btn} onPress={onRetry} accessibilityRole="button">
        <AppText style={styles.btnText}>{t('common:retry')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 12,
    gap: 12,
  },
  message: { fontSize: 15, color: '#991b1b', textAlign: 'center' },
  btn: {
    alignSelf: 'center',
    backgroundColor: '#0f766e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
