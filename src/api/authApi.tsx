import axios from "axios";

function normalizeApiBaseUrl(raw: string): string {
  let v = raw.trim();
  v = v.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

const apiHost =
  (import.meta.env.VITE_API_URL as string | undefined) || process.env.VITE_API_URL;

// - Prefer explicit API_URL_LOGIN/API_URL_REGISTER if you set them in Vercel
// - Otherwise derive from VITE_API_URL
const apilogin =
  process.env.API_URL_LOGIN ||
  (apiHost ? `${normalizeApiBaseUrl(apiHost)}/api/login` : "http://localhost:8080/api/login");
const apiregister =
  process.env.API_URL_REGISTER ||
  (apiHost
    ? `${normalizeApiBaseUrl(apiHost)}/api/register`
    : "http://localhost:8080/api/register");

const axiosWithCreds = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // Backend also returns the logged-in user object (shape may vary)
  user?: any;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  roleID?: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  // withCredentials is required so browser can store HttpOnly refresh cookies cross-site
  const res = await axiosWithCreds.post(`${apilogin}`, payload);
  return res.data;
};

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await axiosWithCreds.post(`${apiregister}`, payload);
  return res.data;
};
