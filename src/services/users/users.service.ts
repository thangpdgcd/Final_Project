import { http as axiosInstance } from '@/api/http/http';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/index';

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const res = await axiosInstance.get<User[]>('/users');
    return res.data;
  },

  getById: async (id: number): Promise<User> => {
    const res = await axiosInstance.get<User>(`/users/${id}`);
    return res.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await axiosInstance.post<User>('/create-users', payload);
    return res.data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const res = await axiosInstance.put<User>(`/users/${id}`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },
};

