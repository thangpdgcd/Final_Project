import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthUser } from '@/types';
import api, { setAccessToken } from '@/api/axiosInstance';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const normalizeUser = (raw: unknown): AuthUser | null => {
    if (!raw || typeof raw !== 'object') return null;
    const u = raw as any;
    const user_ID = Number(u.user_ID ?? u.userId ?? u.id);
    if (!Number.isFinite(user_ID) || user_ID <= 0) return null;
    return {
      user_ID,
      name: String(u.name ?? u.username ?? ''),
      email: String(u.email ?? ''),
      roleID: (u.roleID ?? u.roleId ?? u.role ?? 0) as any,
      avatar: u.avatar ?? undefined,
      phoneNumber: u.phoneNumber ?? u.phone ?? undefined,
      address: u.address ?? undefined,
    };
  };

  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
    // Keep a dedicated user_ID for modules that rely on it (cart/orders).
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? normalizeUser(JSON.parse(raw)) : null;
      const uid = parsed?.user_ID ?? user?.user_ID;
      if (uid) localStorage.setItem('user_ID', String(uid));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((accessToken: string, newUser: AuthUser) => {
    // Only touch the token when a real value is supplied.
    // Callers that only want to refresh user data pass '' to leave the
    // existing token (and its localStorage copies) untouched.
    if (accessToken) {
      setAccessToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
    }
    const normalized = normalizeUser(newUser) ?? newUser;
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
    if ((normalized as any)?.user_ID) {
      localStorage.setItem('user_ID', String((normalized as any).user_ID));
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAccessToken('');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('user_ID');
    }
  }, []);



  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,

    }),
    [user, isAuthenticated, isLoading, login, logout,]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
