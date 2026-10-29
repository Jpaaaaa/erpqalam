import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';
import {
  HOME_THEME_STORAGE_KEY,
  homeDarkPalette,
  homeLightPalette,
  resolveHomePalette,
  type HomePalette,
  type HomeThemePreference,
} from './homeTheme';

type HomeThemeContextValue = {
  preference: HomeThemePreference;
  setPreference: (next: HomeThemePreference) => Promise<void>;
  /** Resolved light/dark (after system). */
  isDark: boolean;
  palette: HomePalette;
};

const HomeThemeContext = createContext<HomeThemeContextValue | undefined>(
  undefined,
);

function isPreference(value: string | null): value is HomeThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function HomeThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<HomeThemePreference>('light');
  const [systemDark, setSystemDark] = useState(
    () => Appearance.getColorScheme() === 'dark',
  );

  useEffect(() => {
    void AsyncStorage.getItem(HOME_THEME_STORAGE_KEY).then((stored) => {
      if (isPreference(stored)) setPreferenceState(stored);
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  const isDark =
    preference === 'dark' ? true : preference === 'light' ? false : systemDark;

  const palette = useMemo(() => resolveHomePalette(isDark), [isDark]);

  const setPreference = useCallback(async (next: HomeThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(HOME_THEME_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ preference, setPreference, isDark, palette }),
    [preference, setPreference, isDark, palette],
  );

  return (
    <HomeThemeContext.Provider value={value}>
      {children}
    </HomeThemeContext.Provider>
  );
}

export function useHomeTheme(): HomeThemeContextValue {
  const ctx = useContext(HomeThemeContext);
  if (!ctx) {
    throw new Error('useHomeTheme must be used within HomeThemeProvider');
  }
  return ctx;
}

/** For tests / storybook without provider. */
export { homeLightPalette, homeDarkPalette };
