import api from '@/api/axiosInstance';

/**
 * Canonical HTTP client for the app.
 *
 * - baseURL is resolved from `VITE_API_URL` and already includes `/api`
 * - request interceptor injects `Authorization` token
 * - response interceptor handles refresh-token queue
 */
export const http = api;

