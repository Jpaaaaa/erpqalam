'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser } from '@/lib/api/client';
import { clearSession, getSession, saveSession } from '@/lib/auth/storage';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  Session,
} from '@/lib/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const session = getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      setUser(session.user);
      try {
        const freshUser = await getCurrentUser();
        const tokens = session.tokens;
        saveSession({ user: freshUser, tokens });
        setUser(freshUser);
      } catch {
        setUser(session.user);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  const refreshUser = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    try {
      const freshUser = await getCurrentUser();
      saveSession({ user: freshUser, tokens: session.tokens });
      setUser(freshUser);
    } catch {
      // keep existing session user
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session: Session = await apiLogin(payload);
    setUser(session.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await apiRegister(payload);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
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
