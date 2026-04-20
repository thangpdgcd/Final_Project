import api from '@/api/axiosInstance';
import type { LoginPayload, RegisterPayload, RegisterResponse, AuthUser } from '@/types';
import axios from 'axios';

type RawLoginResponse = {
  message?: string;
  accessToken?: string;
  token?: string;
  user?: {
    id?: number;
    user_ID?: number;
    userId?: number;
    name?: string;
    email?: string;
    roleID?: number | string;
    avatar?: string;
    phoneNumber?: string;
    address?: string;
  };
};

const normalizeUser = (raw: RawLoginResponse['user']): AuthUser | null => {
  if (!raw) return null;

  const userId = raw.id ?? raw.user_ID ?? raw.userId;
  if (!userId) return null;

  return {
    user_ID: Number(userId),
    name: raw.name ?? `user${userId}`,
    email: raw.email ?? '',
    roleID: raw.roleID ?? 2,
    avatar: raw.avatar,
    phoneNumber: raw.phoneNumber,
    address: raw.address,
  };
};

export const authService = {
  login: async (payload: LoginPayload): Promise<{ accessToken: string; user: AuthUser }> => {
    const email = String(payload.email ?? '').trim();
    const password = payload.password;

    const bodyVariants: Record<string, unknown>[] = [
      { email, password },
      { Email: email, password },
      { email, Password: password },
      { Email: email, Password: password },
      { username: email, password },
      { userName: email, password },
      { account: email, password },
      { identifier: email, password },
      { login: email, password },
    ];

    const candidates = ['/login'];
    const looksLikeMissingRoute = (raw: unknown) => {
      const text = typeof raw === 'string' ? raw : (raw as any)?.message;
      if (typeof text !== 'string') return false;
      const t = text.toLowerCase().trim();
      // Keep this STRICT: many auth APIs return 404 for "user not found".
      return (
        t.includes('cannot post') ||
        t.includes('cannot get') ||
        t.includes('route') ||
        t.includes('endpoint') ||
        t.includes('no route')
      );
    };
    let res: any = null;
    let lastErr: unknown;
    for (const url of candidates) {
      let missingRouteForThisUrl = false;
      for (const body of bodyVariants) {
        try {
          res = await api.post(url, body);
          break;
        } catch (err) {
          lastErr = err;
          if (!axios.isAxiosError(err)) throw err;

          const status = err.response?.status;
          const data = err.response?.data as any;
          const msg =
            (typeof data === 'string' ? data : null) ??
            data?.message ??
            data?.error ??
            data?.data?.message ??
            data?.result?.message ??
            '';
          const msgLower = String(msg || '').toLowerCase();

          // If the route truly doesn't exist, try the next candidate URL.
          if (status === 404 && looksLikeMissingRoute(err.response?.data)) {
            missingRouteForThisUrl = true;
            break;
          }

          // 400 often means payload shape mismatch -> try other body variants.
          if (status === 400) continue;

          // If backend explicitly says "not authorized" for a login endpoint,
          // treat this endpoint as unsuitable and try the next candidate URL.
          if ((status === 401 || status === 403) && msgLower.includes('not authorized')) {
            missingRouteForThisUrl = true;
            break;
          }

          // 401/403/404 are typically auth failures (invalid credentials / forbidden / user not found).
          // Do NOT spam retries with other payload variants.
          if (status === 401 || status === 403 || status === 404) {
            const fallback = 'Email hoặc mật khẩu không đúng.';
            throw new Error(String(msg || fallback).trim());
          }

          throw err;
        }
      }

      if (res) break;
      // Only try the next endpoint when we are confident the current one doesn't exist.
      if (!missingRouteForThisUrl) break;
    }
    if (!res) throw lastErr ?? new Error('LOGIN_NOT_AVAILABLE');

    const raw: any = res.data;
    const payloadData: RawLoginResponse = (
      raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
    ) as any;

    const accessToken =
      payloadData?.accessToken ??
      payloadData?.token ??
      (raw as any)?.accessToken ??
      (raw as any)?.token ??
      (raw as any)?.data?.accessToken ??
      (raw as any)?.data?.token;

    const user = normalizeUser(payloadData?.user ?? (raw as any)?.user ?? (raw as any)?.data?.user);

    if (!accessToken || !user) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    // Only allow roleID=1 in this user-facing app.
    if (String((user as any)?.roleID ?? '').trim() !== '1') {
      throw new Error('ROLE_NOT_ALLOWED');
    }

    return { accessToken, user };
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const candidates = ['/users/register', '/users/signup', '/users/sign-up', '/register'];
    const looksLikeMissingRoute = (raw: unknown) => {
      const text = typeof raw === 'string' ? raw : (raw as any)?.message;
      if (typeof text !== 'string') return false;
      const t = text.toLowerCase().trim();
      return (
        t.includes('cannot post') ||
        t.includes('cannot get') ||
        t.includes('route') ||
        t.includes('endpoint') ||
        t.includes('no route')
      );
    };
    let lastErr: unknown;
    for (const url of candidates) {
      try {
        const res = await api.post<RegisterResponse>(url, payload);
        return res.data;
      } catch (err) {
        lastErr = err;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (looksLikeMissingRoute(err.response?.data)) continue;
        }
        throw err;
      }
    }
    throw lastErr ?? new Error('REGISTER_NOT_AVAILABLE');
  },
};
