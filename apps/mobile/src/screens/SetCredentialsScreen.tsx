import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { setCredentials, resolveUserFacingError } from '../api/client';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { GradientButton } from '../components/auth/GradientButton';
import { useAuth } from '../auth/context';
import { useI18n } from '../i18n/I18nProvider';
import { cardShadow } from '../theme/brand';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function SetCredentialsScreen() {
  const { refreshUser } = useAuth();
  const { fontFamily } = useI18n();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputFont = fontFamily ? { fontFamily } : null;

  async function handleSubmit() {
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth:passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await setCredentials({ username: username.trim(), password });
      await refreshUser();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'auth:setCredentialsError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthLogoHeader />
          <View style={[styles.card, cardShadow]}>
            <AppText style={styles.cardTitle}>{t('auth:setCredentialsTitle')}</AppText>
            <AppText style={styles.description}>{t('auth:setCredentialsDescription')}</AppText>
            {errorIsNetwork ? (
              <NetworkErrorPanel message={error} onRetry={() => void handleSubmit()} />
            ) : error ? (
              <AppText style={styles.error}>{error}</AppText>
            ) : null}

            <AppText style={styles.label}>{t('auth:username')}</AppText>
            <TextInput
              style={[styles.input, ltrText, inputFont]}
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              placeholder={t('auth:usernamePlaceholder')}
              editable={!submitting}
            />

            <AppText style={styles.label}>{t('auth:password')}</AppText>
            <TextInput
              style={[styles.input, ltrText, inputFont]}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />

            <AppText style={styles.label}>{t('auth:confirmPassword')}</AppText>
            <TextInput
              style={[styles.input, ltrText, inputFont]}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!submitting}
            />

            <GradientButton
              onPress={() => void handleSubmit()}
              disabled={submitting}
              isLoading={submitting}
              loadingLabel={t('common:pleaseWait')}
            >
              {t('auth:saveCredentials')}
            </GradientButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: '#b91c1c',
  },
});
