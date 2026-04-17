import axios from "axios";

function normalizeApiBaseUrl(raw: string): string {
  let v = raw.trim();
  v = v.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

const apiHost =
  (import.meta.env.VITE_API_URL as string | undefined) || process.env.VITE_API_URL;

const apiBase = (() => {
  const fallback = "http://localhost:8080/api";
  const host = apiHost ? normalizeApiBaseUrl(apiHost) : fallback;
  const trimmed = String(host).replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
})();

const postWithFallback = async <T,>(
  paths: string[],
  payload: unknown,
): Promise<T> => {
  const looksLikeMissingRoute = (raw: unknown) => {
    const text = typeof raw === "string" ? raw : (raw as any)?.message;
    if (typeof text !== "string") return false;
    const t = text.toLowerCase().trim();
    return (
      t.includes("cannot post") ||
      t.includes("cannot get") ||
      t.includes("route") ||
      t.includes("endpoint") ||
      t.includes("no route")
    );
  };
  let lastErr: unknown;
  for (const p of paths) {
    try {
      const res = await axiosWithCreds.post(`${apiBase}${p}`, payload);
      return res.data as T;
    } catch (err) {
      lastErr = err;
      const status = (err as any)?.response?.status;
      const data = (err as any)?.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ??
        data?.message ??
        data?.error ??
        data?.data?.message ??
        data?.result?.message ??
        "";
      const msgLower = String(msg || "").toLowerCase();

      // Try next endpoint only when it looks like a missing/blocked route.
      if (status === 404 && looksLikeMissingRoute(data)) continue;
      if ((status === 401 || status === 403) && msgLower.includes("not authorized")) continue;
      throw err;
    }
  }
  throw lastErr ?? new Error("AUTH_ENDPOINT_NOT_FOUND");
};

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
  return await postWithFallback<LoginResponse>(
    ["/login"],
    payload,
  );
};

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  return await postWithFallback<RegisterResponse>(
    ["/register"],
    payload,
  );
};
