import { http } from '@/api/http/http';

export interface User {
  user_ID: number; // Backend primary key
  name: string;
  email: string;
  roleID: number | string;
  phoneNumber?: string;
  address?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  roleID: number;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  roleID?: number;
}

export const getAllUsers = async (): Promise<User[]> => {
  const res = await http.get<User[]>('/users');
  return res.data as any;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await http.get<User>(`/users/${id}`);
  return res.data as any;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await http.post<User>('/create-users', payload);
  return res.data as any;
};

export const updateUser = async (id: number, payload: Partial<User>): Promise<User> => {
  const res = await http.put<User>(`/users/${id}`, payload);
  return res.data as any;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const res = await http.delete<{ message: string }>(`/users/${id}`);
  return res.data as any;
};
