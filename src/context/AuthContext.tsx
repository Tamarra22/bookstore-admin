import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { registerUnauthorizedHandler } from '../api/axiosInstance';
import { storage } from '../utils/storage';
import type { LoginPayload, User } from '../types/auth.types';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  // On page load/refresh: if a token is already stored, verify it by asking
  // the server who it belongs to, rather than trusting it blindly.
  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        storage.clearToken();
        setStatus('unauthenticated');
      });
  }, []);

  // Wire the axios interceptor's 401 callback to the same logout logic, so a
  // token that expires mid-session (on any request, anywhere) logs the user
  // out consistently instead of leaving the UI in a stale "authenticated" state.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      storage.clearToken();
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  const login = async (payload: LoginPayload) => {
    const { token } = await authApi.login(payload);
    storage.setToken(token);

    // The login response already includes permissions, id, and name — we
    // could use it directly. We deliberately call /api/me anyway so that
    // "who is the current user" always goes through the exact same function,
    // whether it's right after login or after a page refresh. One source of
    // truth for user hydration, at the cost of one extra request.
    const currentUser = await authApi.me();
    setUser(currentUser);
    setStatus('authenticated');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear local state even if the network call fails — never leave the
      // user stuck looking logged-in when they've asked to log out.
      storage.clearToken();
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  const value = useMemo(() => ({ user, status, login, logout }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
