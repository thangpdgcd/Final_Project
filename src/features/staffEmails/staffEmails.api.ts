import api from '@/api/axiosInstances/axiosInstance';

export type StaffEmail = {
  id: number;
  toUserId: number;
  fromStaffId: number;
  toEmail: string;
  subject: string;
  content: string;
  readAt: string | null;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export const staffEmailsApi = {
  listMine: async (params?: { limit?: number; offset?: number }) => {
    const res = await api.get('/users/me/staff-emails', { params });
    const raw = (res.data as any)?.data ?? (res.data as any)?.result ?? res.data;
    return raw as { items: StaffEmail[]; total: number; limit: number; offset: number };
  },
  markRead: async (id: number) => {
    const res = await api.patch(`/users/me/staff-emails/${encodeURIComponent(String(id))}/read`, {});
    return (res.data as any)?.data ?? (res.data as any)?.result ?? res.data;
  },
};

