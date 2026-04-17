import axios from 'axios';
import { getApiBaseUrl } from '@/shared/lib/http/baseUrl';
import { clearAuthStorage, getAccessToken, setAccessToken } from '@/shared/lib/http/tokenStore';

type RetriableRequestConfig = {
  _retry?: boolean;
};

const isAuthOrRefreshEndpoint = (url: string) =>
  url.includes('/login') || url.includes('/register') || url.includes('/refresh-token');

const baseURL = getApiBaseUrl();

// Refresh-queue: if a refresh is already in flight, subsequent 401s
// wait for it instead of each firing their own /refresh-token call.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const flushQueue = (token: string) => {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
};

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

httpClient.interceptors.request.use(
  (config) => {
    const url = String(config.url ?? '');
    if (isAuthOrRefreshEndpoint(url)) return config;

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (RetriableRequestConfig & { url?: string; headers?: any }) | undefined;
    const requestUrl = String(originalRequest?.url ?? '');

    if (!originalRequest) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);
    if (isAuthOrRefreshEndpoint(requestUrl)) return Promise.reject(error);
    if (error?.response?.status !== 401) return Promise.reject(error);

    // Another refresh is already in flight — queue this request and
    // resolve it once the single refresh completes.
    if (isRefreshing) {
      return new Promise<any>((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) { reject(error); return; }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(httpClient(originalRequest as any));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await axios.post(
        `${baseURL}/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        },
      );

      const newToken = String(
        refreshRes.data?.accessToken ??
          refreshRes.data?.data?.accessToken ??
          refreshRes.data?.result?.accessToken ??
          '',
      );

      if (!newToken) {
        isRefreshing = false;
        flushQueue('');
        return Promise.reject(error);
      }

      setAccessToken(newToken);
      flushQueue(newToken);
      isRefreshing = false;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return httpClient(originalRequest as any);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue('');
      clearAuthStorage();
      return Promise.reject(refreshError);
    }
  },
);

