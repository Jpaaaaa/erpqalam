import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BRAND_GRADIENT, brandShadow } from '../../theme/brand';
import { AppText } from '../../ui/AppText';

export function AuthLogoHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...BRAND_GRADIENT]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.logoBox, brandShadow]}
      >
        <Ionicons name="person-circle-outline" size={32} color="#fff" />
      </LinearGradient>
      <AppText style={styles.appName}>{t('common:appName')}</AppText>
      <AppText style={styles.subtitle}>{t('common:appSubtitle')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#0f766e',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
});
