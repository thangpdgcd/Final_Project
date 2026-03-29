import axiosInstance from '@/services/axios';
import axios from 'axios';
import type { Order, CreateOrderPayload, OrderItem, CreateOrderItemPayload } from '@/types';

let orderItemsUnsupported = false;
let orderItemsGetRoute: string | null | undefined = undefined;

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    const res = await axiosInstance.get<any>('/orders');
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

  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const userId = Number((payload as any)?.user_ID ?? (payload as any)?.userId ?? (payload as any)?.id);
    const totalAmount = Number((payload as any)?.total_Amount ?? (payload as any)?.totalAmount ?? 0);

    const body: Record<string, unknown> = {
      user_ID: Number.isFinite(userId) ? userId : (payload as any)?.user_ID,
      total_Amount: Number.isFinite(totalAmount) ? totalAmount : payload.total_Amount,
      status: payload.status ?? 'Pending',
      shipping_Address: payload.shipping_Address ?? '',
    };

    if (payload.paymentMethod != null) body.paymentMethod = payload.paymentMethod;
    if (payload.paypalCaptureId !== undefined) body.paypalCaptureId = payload.paypalCaptureId;

    const res = await axiosInstance.post<any>('/create-orders', body);
    const data = res.data;
    const order = data?.order ?? data?.data ?? data?.result ?? data;
    return order as Order;
  },

  update: async (id: number, payload: Partial<Order>): Promise<Order> => {
    const res = await axiosInstance.put<Order>(`/orders/${id}`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/orders/${id}`);
    return res.data;
  },

  getItemsByOrderId: async (order_ID: number): Promise<OrderItem[]> => {
    if (orderItemsUnsupported) return [];

    // If we already know the working endpoint shape, avoid probing.
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
        // If previously working route starts 404-ing, fall back to probing again once.
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

    // Endpoint not supported on backend; cache this to avoid spamming console/network.
    orderItemsGetRoute = null;
    return [];
  },

  createItem: async (payload: CreateOrderItemPayload): Promise<OrderItem> => {
    // If BE doesn't expose orderitems endpoints, don't keep spamming requests.
    if (orderItemsUnsupported) return null as unknown as OrderItem;

    const orderIdNum = Number((payload as any)?.order_ID);
    const productId = Number((payload as any)?.product_ID);
    const quantity = Number((payload as any)?.quantity);
    const price = Number((payload as any)?.price);

    // Prefer the most common BE route in this project: POST /api/orderitems
    // Some backends also support /create-orderitems or /orders/:id/items.
    const urls: string[] = ['/orderitems', '/create-orderitems'];
    if (Number.isFinite(orderIdNum) && orderIdNum > 0) urls.push(`/orders/${orderIdNum}/items`);

    // Try payload shapes commonly used by different BE implementations.
    // Note: many BE require order_ID inside body when posting to /orderitems.
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
          // Try next variant/endpoint for typical "wrong shape/route" errors.
          if (status === 404) break;
          if (status === 400 || status === 405 || status === 415 || status === 500) continue;
          throw err;
        }
      }
    }

    // Mark unsupported if backend is missing endpoints (404) or rejects all variants.
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
