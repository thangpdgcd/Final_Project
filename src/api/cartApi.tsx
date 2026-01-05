import axios from "axios";

/**
 * Vite env phải dùng import.meta.env
 * .env: VITE_API_URL=http://localhost:8080
 */
const API_HOST =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";
const apiBase = `${String(API_HOST).replace(/\/$/, "")}/api`;

export interface CartProduct {
  name: string;
  price: number;
  image?: string;
}

export interface CartItem {
  cartitem_ID: number;
  cart_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  products?: CartProduct;
}

export interface AddToCartPayload {
  user_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
}

export interface AddToCartResponse {
  message?: string;
  data?: CartItem;
}

function unwrapList(resData: any): CartItem[] {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.cartItems)) return resData.cartItems;
  return [];
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCartByUserId(user_ID: number): Promise<CartItem[]> {
  const uid = Number(user_ID);
  if (!Number.isFinite(uid) || uid <= 0) return [];

  const res = await axios.get(`${apiBase}/carts`, {
    params: { user_ID: uid },
    headers: { ...authHeaders() },
  });

  return unwrapList(res.data);
}

export async function addToCart(
  payload: AddToCartPayload
): Promise<AddToCartResponse> {
  const safePayload: AddToCartPayload = {
    user_ID: Number(payload.user_ID),
    product_ID: Number(payload.product_ID),
    quantity: Number(payload.quantity),
    price: Number(payload.price),
  };

  const res = await axios.post(`${apiBase}/add-to-cart`, safePayload, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  return res.data as AddToCartResponse;
}

export async function updateCartItem(
  cartItemId: number,
  payload: { quantity: number }
): Promise<CartItem> {
  const id = Number(cartItemId);
  const qty = Number(payload?.quantity);

  const res = await axios.put(
    `${apiBase}/cart-items/${id}`,
    { quantity: qty },
    {
      headers: { "Content-Type": "application/json", ...authHeaders() },
    }
  );

  return res.data as CartItem;
}

export async function removeCartItem(
  cartItemId: number
): Promise<{ message?: string }> {
  const id = Number(cartItemId);

  const res = await axios.delete(`${apiBase}/cart-items/${id}`, {
    headers: { ...authHeaders() },
  });

  return res.data as { message?: string };
}
