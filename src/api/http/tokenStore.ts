import { STORAGE_KEYS } from '@/api/constants/storageKeys';

let inMemoryAccessToken = '';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const safeRemove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const getAccessToken = (): string => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  return safeGet(STORAGE_KEYS.accessToken) ?? safeGet(STORAGE_KEYS.legacyToken) ?? '';
};

export const setAccessToken = (token: string) => {
  inMemoryAccessToken = token;
  if (!token) {
    safeRemove(STORAGE_KEYS.accessToken);
    safeRemove(STORAGE_KEYS.legacyToken);
    return;
  }
  safeSet(STORAGE_KEYS.accessToken, token);
  safeSet(STORAGE_KEYS.legacyToken, token);
};

export const clearAuthStorage = () => {
  inMemoryAccessToken = '';
  safeRemove(STORAGE_KEYS.accessToken);
  safeRemove(STORAGE_KEYS.legacyToken);
  safeRemove(STORAGE_KEYS.user);
  safeRemove(STORAGE_KEYS.userId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:cleared'));
  }
};

