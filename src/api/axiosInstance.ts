import axios from 'axios';

function normalizeApiBaseUrl(raw: string): string {
  let v = raw.trim();
  v = v.replace(/\/+$/, '');

  // If user provided domain without protocol, assume http.
  // If we're running over https (Vercel), prefer https.
  if (!/^https?:\/\//i.test(v)) {
    const proto =
      typeof window !== 'undefined' && window.location?.protocol === 'https:'
        ? 'https'
        : 'http';
    v = `${proto}://${v}`;
  }

  // Ensure it ends with `/api`
  if (v.endsWith('/api')) return v;
  if (v.endsWith('/')) return `${v.slice(0, -1)}/api`;
  return `${v}/api`;
}

const apiUrlEnv = import.meta.env.VITE_API_URL as string | undefined;
// - Prefer VITE_API_URL (set in Vercel env)
// - Fallback to same-origin `/api` (works if you set up rewrites/proxy)
const baseURL = apiUrlEnv ? normalizeApiBaseUrl(apiUrlEnv) : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Access token will be stored in memory via this variable 
// (or passed into the interceptor from AuthContext)
let accessToken = '';

export const setAccessToken = (token: string) => {
  accessToken = token;
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const url = String(config.url ?? '');
    const skipAuth =
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/refresh-token');
    if (accessToken && !skipAuth) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Silent Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const requestUrl: string = String(originalRequest?.url ?? '');

    // Don't attempt silent refresh for auth endpoints (login/register/refresh itself)
    // because a 401 there is almost always "bad credentials" or "no refresh cookie".
    const skipRefresh =
      requestUrl.includes('/login') ||
      requestUrl.includes('/register') ||
      requestUrl.includes('/refresh-token');

    // If 401 and not already retried
    if (!skipRefresh && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const res = await axios.post(`${baseURL}/refresh-token`, {}, { withCredentials: true });
        const { accessToken: newToken } = res.data;
        
        setAccessToken(newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user needs to login again
        console.error('Silent refresh failed', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
