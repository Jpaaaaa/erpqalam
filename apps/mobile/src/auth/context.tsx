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
  login: (payload: LoginPayload) => Promise<Session>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      const session = await getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

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
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  const refreshUser = useCallback(async () => {
    const session = await getSession();
    if (!session) return;

    try {
      const freshUser = await getCurrentUser();
      const latest = await getSession();
      await saveSession({
        user: freshUser,
        tokens: latest?.tokens ?? session.tokens,
      });
      setUser(freshUser);
    } catch {
      await clearSession();
      setUser(null);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session: Session = await apiLogin(payload);
    setUser(session.user);
    return session;
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
      refreshUser,
    }),
    [user, isLoading, login, loginWithGoogle, logout, refreshUser],
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
