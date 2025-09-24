import axios from "axios";

// Base URL lấy từ .env
const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

/* --------- TYPES --------- */
export interface Cart {
  cart_ID: number;
  user_ID: number;
  product_ID: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCartPayload {
  user_ID: number;
  product_ID: number;
  quantity: number;
}

export interface UpdateCartPayload {
  quantity?: number;
}

/* --------- API FUNCTIONS --------- */

// Lấy tất cả cart items
export async function getAllCarts(): Promise<Cart[]> {
  const res = await axios.get<Cart[]>(`${apiBase}/carts`);
  return res.data;
}

// Lấy cart theo ID
export async function getCartById(id: number): Promise<Cart> {
  const res = await axios.get<Cart>(`${apiBase}/carts/${id}`);
  return res.data;
}

// Tạo mới cart item
export async function createCart(payload: CreateCartPayload): Promise<Cart> {
  const res = await axios.post<Cart>(`${apiBase}/carts`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật cart item (ví dụ: đổi số lượng)
export async function updateCart(
  id: number,
  payload: UpdateCartPayload
): Promise<Cart> {
  const res = await axios.put<Cart>(`${apiBase}/carts/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Xoá cart item
export async function deleteCart(id: number): Promise<{ message: string }> {
  const res = await axios.delete<{ message: string }>(`${apiBase}/carts/${id}`);
  return res.data;
}
