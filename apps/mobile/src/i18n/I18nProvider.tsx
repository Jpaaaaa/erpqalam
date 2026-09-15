import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, i18nReady } from './config';
import { FONT_ASSETS, fontFamiliesForLocale } from './fonts';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isAppLocale,
  isRtlLocale,
  type AppLocale,
} from './locales';
import { syncNativeRtl } from './rtl';
import { RestartRequiredScreen } from '../screens/RestartRequiredScreen';
import { needsJsMirror } from '../ui/rtlLayout';

interface I18nContextValue {
  locale: AppLocale;
  isRtl: boolean;
  /** JS row-reverse / explicit margins when native I18nManager RTL is off (Expo Go). */
  mirrorLayout: boolean;
  fontFamily?: string;
  fontFamilyBold?: string;
  setLocale: (locale: AppLocale) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const [needsNativeRestart, setNeedsNativeRestart] = useState(false);

  const finishReady = useCallback(async (next: AppLocale) => {
    setLocaleState(next);
    setReady(true);
    await SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await i18nReady;
      const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      const next: AppLocale = isAppLocale(stored) ? stored : DEFAULT_LOCALE;
      if (!stored) {
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, next);
      }
      await i18n.changeLanguage(next);
      if (cancelled) return;

      await Font.loadAsync(FONT_ASSETS);
      if (cancelled) return;

      const rtl = await syncNativeRtl(isRtlLocale(next));
      if (cancelled) return;

      if (rtl === 'reloading') {
        return;
      }
      if (rtl === 'needs_restart') {
        setNeedsNativeRestart(true);
        await SplashScreen.hideAsync().catch(() => undefined);
        return;
      }

      await finishReady(next);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [finishReady]);

  const setLocale = useCallback(
    async (next: AppLocale) => {
      if (next === locale) return;
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, next);
      await i18n.changeLanguage(next);

      const rtl = await syncNativeRtl(isRtlLocale(next));
      if (rtl === 'reloading') {
        return;
      }
      if (rtl === 'needs_restart') {
        setNeedsNativeRestart(true);
        return;
      }

      setLocaleState(next);
    },
    [locale],
  );

  const fonts = fontFamiliesForLocale(locale);
  const rtl = isRtlLocale(locale);
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      isRtl: rtl,
      mirrorLayout: needsJsMirror(rtl),
      fontFamily: fonts.regular,
      fontFamilyBold: fonts.bold,
      setLocale,
    }),
    [locale, rtl, fonts.regular, fonts.bold, setLocale],
  );

  if (needsNativeRestart) {
    return <RestartRequiredScreen />;
  }

  if (!ready) {
    return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
