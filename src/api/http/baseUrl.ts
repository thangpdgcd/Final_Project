const normalizeApiBaseUrl = (raw: string): string => {
  let value = raw.trim().replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(value)) {
    const proto =
      typeof window !== 'undefined' && window.location?.protocol === 'https:' ? 'https' : 'http';
    value = `${proto}://${value}`;
  }

  if (value.endsWith('/api')) return value;
  return `${value}/api`;
};

export const getApiBaseUrl = (): string => {
  const apiUrlEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrlEnv) return normalizeApiBaseUrl(apiUrlEnv);
  // In dev, prefer relative URL so Vite proxy (`/api` -> backend) works.
  if (import.meta.env.DEV) return '/api';
  // In prod, default to same-origin `/api` (behind reverse proxy).
  if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/api`;
  return 'http://localhost:8080/api';
};

