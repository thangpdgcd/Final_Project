import axiosInstance from '@/services/axios';
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse, AuthUser } from '@/types';

/**
 * Backend login response (from authController.js):
 * {
 *   message: string,
 *   user: { id: number, name: string, email: string, roleID: string },
 *   token: string  // only present when X-Auth-Mode: bearer header is sent
 * }
 *
 * Backend JWT payload: { id: number, roleID: string }
 */

type RawLoginResponse = {
  message?: string;
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
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await axiosInstance.post<RawLoginResponse>('/login', payload, {
      headers: { 'X-Auth-Mode': 'bearer' },
    });

    const data = res.data;
    const token = data.token;
    const user = normalizeUser(data.user);

    if (!token || !user) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    return { token, user };
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await axiosInstance.post<RegisterResponse>('/register', payload);
    return res.data;
  },
};
