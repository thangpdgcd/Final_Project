import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthUser } from '@/types';
import api, { setAccessToken } from '@/api/axiosInstance';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<string | null>;
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((accessToken: string, newUser: AuthUser) => {
    setAccessToken(accessToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
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
      localStorage.removeItem('user');
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.post('/refresh-token');
      const { accessToken } = res.data;
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      return accessToken;
    } catch (error) {
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  // On mount, perform silent refresh
  useEffect(() => {
    const initAuth = async () => {
      await refreshAuth();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshAuth]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
