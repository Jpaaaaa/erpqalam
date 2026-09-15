import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, ApiClientError } from '../api/client';
import { useAuth } from '../auth/context';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function LoginScreen() {
  const { login } = useAuth();
  const { fontFamily } = useI18n();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const inputFont = fontFamily ? { fontFamily } : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <LanguageSwitcher />
        <AppText style={styles.title}>{t('common:appName')}</AppText>
        <AppText style={styles.subtitle}>{t('auth:signIn')}</AppText>

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
          editable={!submitting}
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
          editable={!submitting}
        />

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.buttonText}>{t('auth:signIn')}</AppText>
          )}
        </Pressable>

        <AppText style={[styles.url, { writingDirection: 'ltr' }]}>
          {API_BASE_URL}
        </AppText>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: {
    color: '#b91c1c',
    marginBottom: 16,
  },
  url: {
    marginTop: 24,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
