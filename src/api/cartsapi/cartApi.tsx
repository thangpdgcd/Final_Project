import { http } from '@/api/http/http';

/**
 * Cart API notes:
 * - `http` handles the base URL (env-driven).
 * - Keep payloads numeric to match backend expectations.
 */
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

export const getCartByUserId = async (user_ID: number): Promise<CartItem[]> => {
  const uid = Number(user_ID);
  if (!Number.isFinite(uid) || uid <= 0) return [];

  const res = await http.get(`/carts`, {
    params: { user_ID: uid },
  });

  return unwrapList(res.data);
};

export const addToCart = async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
  const safePayload: AddToCartPayload = {
    user_ID: Number(payload.user_ID),
    product_ID: Number(payload.product_ID),
    quantity: Number(payload.quantity),
    price: Number(payload.price),
  };

  const res = await http.post(`/add-to-cart`, safePayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return res.data as AddToCartResponse;
};

export const updateCartItem = async (
  cartItemId: number,
  payload: { quantity: number },
): Promise<CartItem> => {
  const id = Number(cartItemId);
  const qty = Number(payload?.quantity);

  const res = await http.put(
    `/cart-items/${id}`,
    { quantity: qty },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return res.data as CartItem;
};

export const removeCartItem = async (cartItemId: number): Promise<{ message?: string }> => {
  const id = Number(cartItemId);

  const res = await http.delete(`/cart-items/${id}`);

  return res.data as { message?: string };
};
