import api from '@/api/axiosInstance';
import type { LoginPayload, RegisterPayload, RegisterResponse, AuthUser } from '@/types';

/**
 * Backend login response (from authController.js):
 * {
 *   message: string,
 *   user: { id: number, name: string, email: string, roleID: string },
 *   accessToken: string
 * }
 */

type RawLoginResponse = {
  message?: string;
  accessToken?: string;
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
    const res = await api.post<RawLoginResponse>('/login', payload);

    const data = res.data;
    const accessToken = data.accessToken;
    const user = normalizeUser(data.user);

    if (!accessToken || !user) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    return { accessToken, user };
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>('/register', payload);
    return res.data;
  },
};
