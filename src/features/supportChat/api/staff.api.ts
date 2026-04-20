import axios from 'axios';
import { httpClient } from '@/shared/lib/http/client';
import type { OnlineStaffUser } from '../types';

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
};

const pickArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.staff)) return data.staff;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

const mapStaffUser = (raw: any): OnlineStaffUser | null => {
  const userId = toNumber(raw?.userId ?? raw?.user_ID ?? raw?.id, 0);
  if (!userId) return null;
  return {
    userId,
    name: toString(raw?.name ?? raw?.username ?? raw?.fullName, `Staff ${userId}`),
    avatarUrl:
      typeof raw?.avatarUrl === 'string'
        ? raw.avatarUrl
        : typeof raw?.avatar === 'string'
          ? raw.avatar
          : undefined,
    role: 'staff',
  };
};

export const staffApi = {
  getOnlineStaff: async (): Promise<OnlineStaffUser[]> => {
    try {
      const res = await httpClient.get('/staff/online');
      const list = pickArray(res.data);
      return list.map(mapStaffUser).filter(Boolean) as OnlineStaffUser[];
    } catch (err) {
      // Customers may not have permission for staff presence; treat as "no staff online".
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        return [];
      }
      return [];
    }
  },
};
