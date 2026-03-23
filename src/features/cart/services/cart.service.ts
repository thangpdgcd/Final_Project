import axiosInstance from '@/services/axios';
import type { CartItem, AddToCartPayload, AddToCartResponse } from '@/types';

const mapCartItem = (data: any): CartItem => ({
  ...data,
  cartitem_ID: data?.cartitem_ID ?? data?.cartItemId,
  cart_ID: data?.cart_ID ?? data?.cartId,
  product_ID: data?.product_ID ?? data?.productId,
  quantity: data?.quantity,
  price: data?.price,
  products: data?.products,
});

const unwrapList = (resData: unknown): CartItem[] => {
  let list: any[] = [];
  if (Array.isArray(resData)) list = resData;
  else {
    const data = resData as Record<string, unknown>;
    if (Array.isArray(data?.data)) list = data.data;
    else if (Array.isArray(data?.cartItems)) list = data.cartItems;
  }
  return list.map(mapCartItem);
};

export const cartService = {
  getByUserId: async (user_ID: number): Promise<CartItem[]> => {
    const uid = Number(user_ID);
    if (!Number.isFinite(uid) || uid <= 0) return [];
    const res = await axiosInstance.get('/carts', { params: { user_ID: uid } });
    return unwrapList(res.data);
  },

  addToCart: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
    const safePayload: AddToCartPayload = {
      user_ID: Number(payload.user_ID),
      product_ID: Number(payload.product_ID),
      quantity: Number(payload.quantity),
      price: Number(payload.price),
    };
    const res = await axiosInstance.post<AddToCartResponse>('/add-to-cart', safePayload);
    return res.data;
  },

  updateItem: async (cartItemId: number, quantity: number): Promise<CartItem> => {
    const res = await axiosInstance.put<any>(`/cart-items/${cartItemId}`, { quantity });
    return mapCartItem(res.data);
  },

  removeItem: async (cartItemId: number): Promise<{ message?: string }> => {
    const res = await axiosInstance.delete<{ message?: string }>(`/cart-items/${cartItemId}`);
    return res.data;
  },
};
