import axios from 'axios';
import axiosInstance from '@/services/axios';
import type { CartItem, AddToCartPayload, AddToCartResponse } from '@/types';

export const mapCartItem = (data: any): CartItem => ({
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
    else if (Array.isArray(data?.items)) list = data.items as any[];
    else if (Array.isArray(data?.result)) list = data.result as any[];
  }
  return list.map(mapCartItem);
};

export const cartService = {
  getByUserId: async (user_ID: number): Promise<CartItem[]> => {
    const uid = Number(user_ID);
    if (!Number.isFinite(uid) || uid <= 0) return [];
    const candidates: Array<{ url: string; params?: Record<string, unknown> }> = [
      { url: '/carts', params: { user_ID: uid } },
      { url: '/cart', params: { user_ID: uid } },
      { url: '/cart-items', params: { user_ID: uid } },
      { url: '/cartitems', params: { user_ID: uid } },
    ];

    let lastErr: unknown;
    for (const c of candidates) {
      try {
        const res = await axiosInstance.get(c.url, c.params ? { params: c.params } : undefined);
        return unwrapList(res.data);
      } catch (err) {
        lastErr = err;
        if (axios.isAxiosError(err) && err.response?.status === 404) continue;
        throw err;
      }
    }

    if (axios.isAxiosError(lastErr) && lastErr.response?.status === 404) {
      return [];
    }
    return [];
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
        const res = await axiosInstance.post<any>('/add-to-cart', body);
        const envelope = res.data as Record<string, unknown> | undefined;
        const inner = envelope?.data as Record<string, unknown> | CartItem | undefined;
        const rawItem =
          inner && typeof inner === 'object' && !Array.isArray(inner) && 'cart' in inner
            ? (inner as { cart?: unknown }).cart
            : inner;
        const mapped =
          rawItem && typeof rawItem === 'object' && !Array.isArray(rawItem)
            ? mapCartItem(rawItem)
            : undefined;
        return {
          message: typeof envelope?.message === 'string' ? envelope.message : undefined,
          data: mapped,
        };
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

/**
 * Makes the server cart match the checkout selection so POST /create-orders
 * creates the correct line items (backend builds the order from the DB cart).
 */
export async function syncCartToSelectionForCheckout(
  userId: number,
  selected: CartItem[],
): Promise<void> {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) throw new Error('INVALID_USER_ID');

  const selectedPids = new Set(
    selected
      .map((i) => Number((i as CartItem & { productId?: number }).product_ID ?? (i as CartItem & { productId?: number }).productId))
      .filter((n) => Number.isFinite(n) && n > 0),
  );
  if (selectedPids.size === 0) throw new Error('EMPTY_CHECKOUT_SELECTION');

  const serverCart = await cartService.getByUserId(uid);

  for (const row of serverCart) {
    const pid = Number((row as CartItem).product_ID ?? (row as CartItem & { productId?: number }).productId);
    if (!selectedPids.has(pid)) {
      const cid = Number((row as CartItem).cartitem_ID ?? (row as CartItem & { cartItemId?: number }).cartItemId);
      if (Number.isFinite(cid) && cid > 0) await cartService.removeItem(cid);
    }
  }

  const fresh = await cartService.getByUserId(uid);

  for (const sel of selected) {
    const pid = Number((sel as CartItem).product_ID ?? (sel as CartItem & { productId?: number }).productId);
    if (!Number.isFinite(pid) || pid <= 0) continue;
    const wantQty = Number(sel.quantity) || 1;
    const price = Number(sel.products?.price ?? sel.price ?? 0);
    const serverRow = fresh.find(
      (r) => Number((r as CartItem).product_ID ?? (r as CartItem & { productId?: number }).productId) === pid,
    );
    if (!serverRow) {
      await cartService.addToCart({
        user_ID: uid,
        product_ID: pid,
        quantity: wantQty,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
      });
    } else {
      const curQty = Number(serverRow.quantity) || 0;
      const cid = Number((serverRow as CartItem).cartitem_ID ?? (serverRow as CartItem & { cartItemId?: number }).cartItemId);
      if (Number.isFinite(cid) && cid > 0 && curQty !== wantQty) {
        await cartService.updateItem(cid, wantQty);
      }
    }
  }
}

