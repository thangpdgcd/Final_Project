import { http } from '@/api/http/http';

// -------- TYPES --------
export interface User {
  user_ID: number; // ✅ thêm đúng PK backend
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

// -------- API FUNCTIONS --------

// ✅ Lấy tất cả người dùng
export const getAllUsers = async (): Promise<User[]> => {
  const res = await http.get<User[]>('/users');
  return res.data as any;
};

// ✅ Lấy người dùng theo ID
export const getUserById = async (id: number): Promise<User> => {
  const res = await http.get<User>(`/users/${id}`);
  return res.data as any;
};

// ✅ Thêm người dùng mới
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await http.post<User>('/create-users', payload);
  return res.data as any;
};

// ✅ Cập nhật thông tin người dùng
export const updateUser = async (id: number, payload: Partial<User>): Promise<User> => {
  const res = await http.put<User>(`/users/${id}`, payload);
  return res.data as any;
};

// ✅ Xoá người dùng
export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const res = await http.delete<{ message: string }>(`/users/${id}`);
  return res.data as any;
};
