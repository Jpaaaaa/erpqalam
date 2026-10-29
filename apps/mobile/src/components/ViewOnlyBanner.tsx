import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../ui/AppText';

export function ViewOnlyBanner() {
  const { t } = useTranslation('attendance');
  return (
    <View style={styles.banner}>
      <AppText style={styles.text}>{t('more.viewOnly')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  text: { fontSize: 13, color: '#475569', textAlign: 'center' },
});
