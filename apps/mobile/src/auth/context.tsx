import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  googleLogin as apiGoogleLogin,
  login as apiLogin,
  logout as apiLogout,
  onSessionInvalidated,
} from '../api/client';
import { clearSession, getSession, saveSession } from './storage';
import type { AuthUser, LoginPayload, Session } from '../types/auth';

const AUTH_ME_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onSessionInvalidated(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    async function bootstrap() {
      console.log('[auth] bootstrap start');
      const session = await getSession();
      if (!session) {
        console.log('[auth] no stored session');
        setIsLoading(false);
        return;
      }

      console.log('[auth] /auth/me start');
      try {
        const freshUser = await withTimeout(
          getCurrentUser(),
          AUTH_ME_TIMEOUT_MS,
          '/auth/me',
        );
        const latest = await getSession();
        await saveSession({
          user: freshUser,
          tokens: latest?.tokens ?? session.tokens,
        });
        setUser(freshUser);
        console.log('[auth] /auth/me done');
      } catch (err) {
        console.warn('[auth] /auth/me failed', err);
        await clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('[auth] bootstrap done');
      }
    }

    void bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session: Session = await apiLogin(payload);
    setUser(session.user);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const session: Session = await apiGoogleLogin(idToken);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
