import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import apiClient, { ApiError } from '../api/apiClient';
import { authApi } from '../api/auth';

/* ── Shape ─────────────────────────────────────── */

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

/* ── Context ───────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ──────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — ask Django who I am
  useEffect(() => {
    authApi.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      // Ensure CSRF cookie is present before the POST
      await apiClient.initCsrf();
      const u = await authApi.login({ username, password });
      setUser(u);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        const msg =
          // Django returns {"non_field_errors": [...]} or {"detail": "..."}
          (err.data as Record<string, string[]>)?.non_field_errors?.[0] ??
          (err.data as Record<string, string>)?.detail ??
          'Invalid username or password.';
        return { ok: false, error: msg };
      }
      return { ok: false, error: 'Server error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
