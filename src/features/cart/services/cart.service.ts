import axios from 'axios';
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
    if (Array.isArray(data?.data)) list = data.data as any[];
    else if (Array.isArray(data?.cartItems)) list = data.cartItems as any[];
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
    const userId = Number(payload.user_ID);
    const productId = Number(payload.product_ID);
    const quantity = Number(payload.quantity);
    const price = Number(payload.price);

    const variants: Record<string, unknown>[] = [
      { user_ID: userId, product_ID: productId, quantity, price },
      { userId, productId, quantity, price },
    ];

    let lastErr: unknown;
    for (const body of variants) {
      try {
        const res = await axiosInstance.post<AddToCartResponse>('/add-to-cart', body);
        return res.data;
      } catch (err) {
        lastErr = err;
        if (axios.isAxiosError(err) && err.response?.status === 400) continue;
        throw err;
      }
    }
    throw lastErr ?? new Error('ADD_TO_CART_FAILED');
  },

  updateItem: async (cartItemId: number, quantity: number): Promise<CartItem> => {
    const id = Number(cartItemId);
    const qty = Number(quantity);
    const urls = [`/cart-items/${id}`, `/cartitems/${id}`];

    let lastErr: unknown;
    for (const url of urls) {
      try {
        const res = await axiosInstance.put<any>(url, { quantity: qty });
        return mapCartItem(res.data);
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;
        const status = err.response?.status;
        if (status === 404 || status === 400 || status === 405 || status === 415 || status === 500) continue;
        throw err;
      }
    }
    throw lastErr ?? new Error('UPDATE_CART_ITEM_FAILED');
  },

  removeItem: async (cartItemId: number): Promise<{ message?: string }> => {
    const id = Number(cartItemId);
    const urls = [`/cart-items/${id}`, `/cartitems/${id}`];

    let lastErr: unknown;
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const res = await axiosInstance.delete<{ message?: string }>(url);
        return res.data;
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;

        const status = err.response?.status;

        if (status === 404) {
          if (i === 0) continue;
          return { message: 'Cart item not found' };
        }

        if (status === 400 || status === 405 || status === 415) {
          return { message: 'Remove cart item skipped' };
        }

        if (status === 500) {
          return { message: 'Remove cart item failed on server' };
        }

        throw err;
      }
    }

    if (axios.isAxiosError(lastErr)) {
      return { message: 'Remove cart item skipped' };
    }
    throw lastErr ?? new Error('REMOVE_CART_ITEM_FAILED');
  },
};

