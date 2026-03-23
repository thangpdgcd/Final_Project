import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

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
    if (accessToken) {
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
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
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
