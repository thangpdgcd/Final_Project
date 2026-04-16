import api from '@/api/axiosInstance';
import type { LoginPayload, RegisterPayload, RegisterResponse, AuthUser } from '@/types';

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
    const body = {
      email: String(payload.email ?? '').trim(),
      password: payload.password,
    };
    const res = await api.post('/login', body);

    const raw: any = res.data;
    const payloadData: RawLoginResponse = (raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw) as any;

    const accessToken = payloadData?.accessToken ?? payloadData?.token;
    const user = normalizeUser(payloadData?.user);

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

