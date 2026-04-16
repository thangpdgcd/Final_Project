import axiosInstance from '@/services/axios';
import axios from 'axios';
import type { Order, CreateOrderPayload, OrderItem, CreateOrderItemPayload } from '@/types';

let orderItemsUnsupported = false;
let orderItemsGetRoute: string | null | undefined = undefined;

export const ordersService = {
  /** Current user's orders (JWT). Prefer over GET /orders (all orders, staff-only use case). */
  getAll: async (): Promise<Order[]> => {
    const res = await axiosInstance.get<any>('/my-orders');
    const data = res.data;
    if (Array.isArray(data)) return data as Order[];
    if (data && Array.isArray(data.orders)) return data.orders as Order[];
    if (data && Array.isArray(data.data)) return data.data as Order[];
    if (data && Array.isArray(data.result)) return data.result as Order[];
    return [];
  },

  getById: async (id: number): Promise<Order> => {
    const res = await axiosInstance.get<Order>(`/orders/${id}`);
    return res.data;
  },

  /**
   * Creates an order from the server-side cart (backend copies cart → order lines).
   * Body is only `status`; totals and items come from the cart — sync cart before calling.
   */
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const status = String(payload.status ?? 'pending').trim() || 'pending';
    const paymentMethod = String(payload.paymentMethod ?? 'COD').trim() || 'COD';
    const body: Record<string, unknown> = { status, paymentMethod };
    if (payload.paypalCaptureId) body.paypalCaptureId = payload.paypalCaptureId;
    if (payload.shipping_Address) body.note = payload.shipping_Address;
    const res = await axiosInstance.post<any>('/create-orders', body);
    const data = res.data;
    const inner = data?.data ?? data;
    const order =
      inner?.order ??
      data?.order ??
      data?.data?.order ??
      data?.result?.order ??
      (inner && typeof inner === 'object' && 'orderId' in inner ? inner : null) ??
      data?.data ??
      data?.result ??
      data;
    return order as Order;
  },

  update: async (id: number, payload: Partial<Order>): Promise<Order> => {
    const res = await axiosInstance.put<Order>(`/orders/${id}`, payload);
    return res.data;
  },

  /** Customer cancels own order (allowed only in early statuses by backend). */
  cancelOrder: async (id: number, payload?: { note?: string }): Promise<Order> => {
    const res = await axiosInstance.patch<any>(`/orders/${id}/cancel`, payload ?? {});
    const data = res.data;
    const order =
      data?.order ??
      data?.data?.order ??
      data?.data ??
      data?.result?.order ??
      data?.result ??
      data;
    return order as Order;
  },

  requestRefund: async (id: number, payload?: { note?: string }): Promise<Order> => {
    const res = await axiosInstance.patch<any>(`/orders/${id}/refund-request`, payload ?? {});
    const data = res.data;
    const order =
      data?.order ??
      data?.data?.order ??
      data?.data ??
      data?.result?.order ??
      data?.result ??
      data;
    return order as Order;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/orders/${id}`);
    return res.data;
  },

  getItemsByOrderId: async (order_ID: number): Promise<OrderItem[]> => {
    if (orderItemsUnsupported) return [];

    if (orderItemsGetRoute === null) return [];
    if (typeof orderItemsGetRoute === 'string') {
      try {
        const url =
          orderItemsGetRoute === 'orders_items'
            ? `/orders/${order_ID}/items`
            : orderItemsGetRoute === 'orderitems_query'
              ? `/orderitems?order_ID=${order_ID}`
              : orderItemsGetRoute === 'orderitems_nested'
                ? `/orderitems/order/${order_ID}`
                : `/orderitems/${order_ID}`;

        const res = await axiosInstance.get<any>(url);
        const data = res.data;
        const list =
          Array.isArray(data)
            ? data
            : (data?.items ?? data?.orderItems ?? data?.orderitems ?? data?.data ?? data?.rows ?? []);
        return (Array.isArray(list) ? list : []) as OrderItem[];
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          orderItemsGetRoute = undefined;
        } else {
          throw err;
        }
      }
    }

    const candidates: Array<{ key: 'orders_items' | 'orderitems_query' | 'orderitems_nested' | 'orderitems_id'; url: string }> = [
      { key: 'orders_items', url: `/orders/${order_ID}/items` },
      { key: 'orderitems_query', url: `/orderitems?order_ID=${order_ID}` },
      { key: 'orderitems_nested', url: `/orderitems/order/${order_ID}` },
      { key: 'orderitems_id', url: `/orderitems/${order_ID}` },
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get<any>(url.url);
        const data = res.data;
        const list =
          Array.isArray(data)
            ? data
            : (data?.items ?? data?.orderItems ?? data?.orderitems ?? data?.data ?? data?.rows ?? []);
        orderItemsGetRoute = url.key;
        return (Array.isArray(list) ? list : []) as OrderItem[];
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          continue;
        }
        throw err;
      }
    }

    orderItemsGetRoute = null;
    return [];
  },

  createItem: async (payload: CreateOrderItemPayload): Promise<OrderItem> => {
    if (orderItemsUnsupported) return null as unknown as OrderItem;

    const orderIdNum = Number((payload as any)?.order_ID);
    const productId = Number((payload as any)?.product_ID);
    const quantity = Number((payload as any)?.quantity);
    const price = Number((payload as any)?.price);

    const urls: string[] = ['/orderitems', '/create-orderitems'];
    if (Number.isFinite(orderIdNum) && orderIdNum > 0) urls.push(`/orders/${orderIdNum}/items`);

    const bodyVariants: Record<string, unknown>[] = [
      { order_ID: orderIdNum, product_ID: productId, quantity, price },
      { orderId: orderIdNum, productId, quantity, price },
      { product_ID: productId, quantity, price },
      { productId, quantity, price },
    ];

    let lastErr: unknown;
    for (const url of urls) {
      for (const body of bodyVariants) {
        try {
          const res = await axiosInstance.post<any>(url, body);
          const data = res.data;
          const record = data?.orderitem ?? data?.orderItem ?? data?.data ?? data;
          return record as OrderItem;
        } catch (err) {
          lastErr = err;
          if (!axios.isAxiosError(err)) throw err;
          const status = err.response?.status;
          if (status === 404) break;
          if (status === 400 || status === 405 || status === 415 || status === 500) continue;
          throw err;
        }
      }
    }

    if (axios.isAxiosError(lastErr)) {
      const status = lastErr.response?.status;
      if (status === 404 || status === 405) {
        orderItemsUnsupported = true;
        return null as unknown as OrderItem;
      }
    }
    return null as unknown as OrderItem;
  },

  deleteItem: async (orderitem_ID: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/orderitems/${orderitem_ID}`);
    return res.data;
  },
};

