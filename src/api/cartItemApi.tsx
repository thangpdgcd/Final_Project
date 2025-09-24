import axios from "axios";
const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

/* --------- TYPES --------- */
export interface CartItem {
  cartitem_ID: number;
  cart_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCartItemPayload {
  cart_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
}

export interface UpdateCartItemPayload {
  quantity?: number;
}

/* --------- API FUNCTIONS --------- */

// Lấy tất cả cart items
export async function getAllCartItems(): Promise<CartItem[]> {
  const res = await axios.get<CartItem[]>(`${apiBase}/cart-items`);
  return res.data;
}

// Lấy cart item theo ID
export async function getCartItemById(id: number): Promise<CartItem> {
  const res = await axios.get<CartItem>(`${apiBase}/cart-items/${id}`);
  return res.data;
}

// Tạo cart item mới
export async function createCartItem(
  payload: CreateCartItemPayload
): Promise<CartItem> {
  const res = await axios.post<CartItem>(`${apiBase}/cart-items`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật cart item
export async function updateCartItem(
  id: number,
  payload: UpdateCartItemPayload
): Promise<CartItem> {
  const res = await axios.put<CartItem>(
    `${apiBase}/cart-items/${id}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

// Xoá cart item
export async function deleteCartItem(id: number): Promise<{ message: string }> {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/cart-items/${id}`
  );
  return res.data;
}
