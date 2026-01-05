import axios from "axios";

const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

// -------- TYPES --------
export interface User {
  user_ID: number; // ✅ thêm đúng PK backend
  name: string;
  email: string;
  roleID: number | string;
  phoneNumber?: string;
  address?: string;
  status?: "active" | "inactive";
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
export async function getAllUsers(): Promise<User[]> {
  const res = await axios.get<User[]>(`${apiBase}/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

// ✅ Lấy người dùng theo ID
export async function getUserById(id: number): Promise<User> {
  const res = await axios.get<User>(`${apiBase}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

// ✅ Thêm người dùng mới
export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await axios.post<User>(`${apiBase}/create-users`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

// ✅ Cập nhật thông tin người dùng
export async function updateUser(
  id: number,
  payload: Partial<User>
): Promise<User> {
  const res = await axios.put<User>(`${apiBase}/users/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

// ✅ Xoá người dùng
export async function deleteUser(id: number): Promise<{ message: string }> {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
}
