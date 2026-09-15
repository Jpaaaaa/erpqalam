import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/context';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function NoAccessScreen() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LanguageSwitcher />
      <AppText style={styles.title}>{t('mobile:noAccessTitle')}</AppText>
      <AppText style={styles.body}>{t('hr:accessDenied')}</AppText>
      {user ? (
        <AppText style={[styles.meta, ltrText]}>
          {user.email} · {user.role}
        </AppText>
      ) : null}
      <Pressable style={styles.button} onPress={() => void logout()}>
        <AppText style={styles.buttonText}>{t('auth:signOut')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
