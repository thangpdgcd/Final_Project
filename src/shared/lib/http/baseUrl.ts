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
  // Default to local backend in dev to avoid accidentally calling the FE dev server.
  return apiUrlEnv ? normalizeApiBaseUrl(apiUrlEnv) : 'http://localhost:8080/api';
};
