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
  login as apiLogin,
  logout as apiLogout,
  onSessionInvalidated,
} from '../api/client';
import { clearSession, getSession, saveSession } from './storage';
import type { AuthUser, LoginPayload, Session } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
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
      const session = await getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

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
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session: Session = await apiLogin(payload);
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
      logout,
    }),
    [user, isLoading, login, logout],
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
