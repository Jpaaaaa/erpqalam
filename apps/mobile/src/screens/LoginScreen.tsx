import { useEffect, useState } from 'react';
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
import { API_BASE_URL, ApiClientError } from '../api/client';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { GradientButton } from '../components/auth/GradientButton';
import { OrDivider } from '../components/auth/OrDivider';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useGoogleAuthRequest } from '../hooks/useGoogleAuthRequest';
import { useAuth } from '../auth/context';
import { useI18n } from '../i18n/I18nProvider';
import { cardShadow } from '../theme/brand';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const { fontFamily, mirrorLayout } = useI18n();
  const { t } = useTranslation();
  const { request, response, promptAsync, configured } = useGoogleAuthRequest();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error') {
        setError(t('auth:googleCallbackError'));
        setGoogleLoading(false);
      }
      return;
    }

    const idToken = response.params.id_token;
    if (!idToken) {
      setError(t('auth:googleCallbackError'));
      setGoogleLoading(false);
      return;
    }

    void (async () => {
      setError('');
      try {
        await loginWithGoogle(idToken);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : t('auth:googleCallbackError'),
        );
      } finally {
        setGoogleLoading(false);
      }
    })();
  }, [response, loginWithGoogle, t]);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : t('auth:loginError'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGooglePress() {
    if (!configured || !request) {
      setError(t('auth:googleCallbackError'));
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setGoogleLoading(false);
      }
    } catch {
      setError(t('auth:googleCallbackError'));
      setGoogleLoading(false);
    }
  }

  const inputFont = fontFamily ? { fontFamily } : null;
  const busy = submitting || googleLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.langRow, mirrorLayout && styles.langRowRtl]}>
          <LanguageSwitcher />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <AuthLogoHeader />

          <View style={[styles.card, cardShadow]}>
            <AppText style={styles.cardTitle}>{t('auth:signIn')}</AppText>

            {error ? <AppText style={styles.error}>{error}</AppText> : null}

            <AppText style={styles.label}>{t('auth:email')}</AppText>
            <TextInput
              style={[styles.input, ltrText, inputFont]}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth:emailPlaceholder')}
              editable={!busy}
            />

            <AppText style={styles.label}>{t('auth:password')}</AppText>
            <TextInput
              style={[styles.input, ltrText, inputFont]}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />

            <GradientButton
              onPress={() => void handleSubmit()}
              disabled={busy}
              isLoading={submitting}
              loadingLabel={t('common:pleaseWait')}
            >
              {t('auth:signIn')}
            </GradientButton>

            <OrDivider label={t('auth:orContinueWith')} />

            <GoogleSignInButton
              label={t('auth:signInWithGoogle')}
              onPress={() => void handleGooglePress()}
              disabled={busy || !configured || !request}
              isLoading={googleLoading}
            />
          </View>

          <AppText style={[styles.url, ltrText]}>{API_BASE_URL}</AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  langRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  langRowRtl: { alignItems: 'flex-end' },
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
    marginBottom: 4,
  },
  url: {
    marginTop: 20,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
