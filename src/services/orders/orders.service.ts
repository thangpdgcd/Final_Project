import { http as axiosInstance } from '@/api/http/http';
import axios from 'axios';
import type { Order, CreateOrderPayload, OrderItem, CreateOrderItemPayload } from '@/types/index';
import { STORAGE_KEYS } from '@/api/constants/storageKeys';

let orderItemsUnsupported = false;
let orderItemsGetRoute: string | null | undefined = undefined;

/** Map backend variants (camelCase / strings) to our Order shape. */
const normalizeOrderRow = (raw: Record<string, unknown>): Order => {
  const r = raw as any;
  const order_ID = Number(r.order_ID ?? r.orderId ?? r.order_id ?? 0);
  const user_ID = Number(r.user_ID ?? r.userId ?? r.user_id ?? 0);
  const totalRaw = r.total_Amount ?? r.totalAmount ?? r.total_amount ?? 0;
  const total_Amount =
    typeof totalRaw === 'string'
      ? Number(String(totalRaw).replace(/[^0-9.-]/g, ''))
      : Number(totalRaw);
  return {
    ...r,
    order_ID: Number.isFinite(order_ID) ? order_ID : 0,
    user_ID: Number.isFinite(user_ID) ? user_ID : 0,
    total_Amount: Number.isFinite(total_Amount) ? total_Amount : 0,
    status: r.status != null ? String(r.status) : r.status,
    shippingStatus:
      r.shippingStatus ??
      r.shipping_status ??
      r.deliveryStatus ??
      r.delivery_status ??
      r.deliverystatus,
    shipping_Address: r.shipping_Address ?? r.shippingAddress ?? r.shipping_address,
    paymentMethod: r.paymentMethod ?? r.payment_method,
    paypalCaptureId: r.paypalCaptureId ?? r.paypal_capture_id,
    createdAt: r.createdAt ?? r.created_at,
    updatedAt: r.updatedAt ?? r.updated_at,
  };
};

const getNormalizedRoleID = (): '1' | '2' | '3' | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    const u = JSON.parse(raw) as any;
    const v = String(u?.roleID ?? u?.roleId ?? u?.role ?? '')
      .trim()
      .toLowerCase();
    if (!v) return null;
    if (v === '1' || v === 'customer' || v === 'user') return '1';
    if (v === '2' || v === 'admin') return '2';
    if (v === '3' || v === 'staff') return '3';
    return null;
  } catch {
    return null;
  }
};

export const ordersService = {
  /** Current user's orders (JWT). Prefer over GET /orders (all orders, staff-only use case). */
  getAll: async (): Promise<Order[]> => {
    const roleID = getNormalizedRoleID();
    const ORDERS_LIST_DISABLED_KEY = `orders:list_disabled:${roleID ?? 'unknown'}`;
    // IMPORTANT:
    // In the customer app, the profile "Orders" tab should show the CURRENT user's orders
    // even if they are logged in with an admin/staff account.
    // So we always try "my orders" endpoints first, then fall back to staff/admin endpoints.
    const userIdFromStorage = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.userId);
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      } catch {
        return undefined;
      }
    })();

    const byUserCandidates = userIdFromStorage
      ? [
          `/orders/user/${userIdFromStorage}`,
          `/orders/users/${userIdFromStorage}`,
          `/users/${userIdFromStorage}/orders`,
          `/orders?user_ID=${userIdFromStorage}`,
          `/orders?userId=${userIdFromStorage}`,
          `/orders/by-user/${userIdFromStorage}`,
        ]
      : [];

    const candidates =
      roleID === '1'
        ? ['/my-orders', '/orders/my', '/orders/me', ...byUserCandidates]
        : [
            '/my-orders',
            '/orders/my',
            '/orders/me',
            ...byUserCandidates,
            '/staff/orders',
            '/orders',
          ];

    const extractList = (payload: any): unknown[] | null => {
      if (!payload) return null;
      if (Array.isArray(payload)) return payload;

      // Common shapes:
      // - { success, message, data: [...] }
      // - { data: [...] }
      // - { orders: [...] }
      // - { result: [...] }
      // - { data: { data: [...] } } or { data: { orders: [...] } }
      const direct =
        (Array.isArray(payload.orders) && payload.orders) ||
        (Array.isArray(payload.data) && payload.data) ||
        (Array.isArray(payload.result) && payload.result) ||
        null;
      if (direct) return direct;

      const inner = payload?.data ?? payload?.result ?? payload?.payload ?? null;
      if (inner) {
        if (Array.isArray(inner)) return inner;
        if (Array.isArray(inner.orders)) return inner.orders;
        if (Array.isArray(inner.data)) return inner.data;
        if (Array.isArray(inner.rows)) return inner.rows;
        if (Array.isArray(inner.items)) return inner.items;
      }

      if (Array.isArray(payload.rows)) return payload.rows;
      if (Array.isArray(payload.items)) return payload.items;
      return null;
    };

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get<any>(url);
        const data = res.data;
        // Orders endpoint works → clear any stale disable flag.
        try {
          localStorage.removeItem(ORDERS_LIST_DISABLED_KEY);
        } catch {
          // ignore
        }
        const asList = extractList(data);
        if (asList) return (asList as Record<string, unknown>[]).map(normalizeOrderRow);

        // Endpoint exists but returned unexpected shape; try the next candidate.
        continue;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) continue;
          if (status === 403) continue;
        }
        throw err;
      }
    }

    return [];
  },

  getById: async (id: number): Promise<Order> => {
    const orderId = Number(id);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      throw new Error('INVALID_ORDER_ID');
    }
    try {
      const res = await axiosInstance.get<any>(`/orders/${orderId}`);
      const payload = res.data?.data ?? res.data;
      // Backend uses sendSuccess wrapper: { success, message, data }
      const record = payload?.order ?? payload ?? res.data;
      return normalizeOrderRow(record as any);
    } catch (err) {
      // If backend forbids direct GET /orders/:id for customers in some deployments,
      // fall back to "my orders" and find it locally.
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          const mine = await ordersService.getAll();
          const found = mine.find(
            (o) => Number(o.order_ID) === orderId || Number((o as any).orderId) === orderId,
          );
          if (found) return found;
        }
      }
      throw err;
    }
  },

  /**
   * Creates an order from the server-side cart (backend copies cart → order lines).
   * Body is only `status`; totals and items come from the cart — sync cart before calling.
   */
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const status = String(payload.status ?? 'pending').trim() || 'pending';
    const paymentMethod = String(payload.paymentMethod ?? 'COD').trim() || 'COD';
    // Backend implementations vary:
    // - some create orders purely from server cart (need only status)
    // - others require { user_ID, total_Amount, shipping_Address }
    // We send the full payload when available, while keeping cart-based behavior compatible.
    const body: Record<string, unknown> = { status, paymentMethod };
    const userId = Number((payload as any)?.user_ID ?? (payload as any)?.userId);
    if (Number.isFinite(userId) && userId > 0) {
      body.user_ID = userId;
      body.userId = userId;
    }
    const totalAmount = Number((payload as any)?.total_Amount ?? (payload as any)?.totalAmount);
    if (Number.isFinite(totalAmount) && totalAmount >= 0) {
      body.total_Amount = totalAmount;
      body.totalAmount = totalAmount;
    }
    if (payload.paypalCaptureId != null) body.paypalCaptureId = payload.paypalCaptureId;

    // New payment fields (backend migration 20260427100000-add-payment-fields-to-orders.cjs)
    if ((payload as any).payment_ref != null) body.payment_ref = (payload as any).payment_ref;
    if ((payload as any).payment_provider != null)
      body.payment_provider = (payload as any).payment_provider;
    if ((payload as any).payment_status != null) body.payment_status = (payload as any).payment_status;
    if ((payload as any).payment_method != null) body.payment_method = (payload as any).payment_method;
    if ((payload as any).paid_at != null) body.paid_at = (payload as any).paid_at;
    if ((payload as any).shippingMethod) {
      body.shippingMethod = (payload as any).shippingMethod;
      body.shipping_method = (payload as any).shippingMethod;
    }
    if ((payload as any).items) {
      body.items = (payload as any).items;
      body.cartItems = (payload as any).items;
      body.orderItems = (payload as any).items;
    }
    if ((payload as any).note) {
      body.note = String((payload as any).note);
    }
    if (payload.shipping_Address) {
      body.shipping_Address = payload.shipping_Address;
      body.shippingAddress = payload.shipping_Address;
    }
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
      data?.order ?? data?.data?.order ?? data?.data ?? data?.result?.order ?? data?.result ?? data;
    return order as Order;
  },

  requestRefund: async (id: number, payload?: { note?: string }): Promise<Order> => {
    const res = await axiosInstance.patch<any>(`/orders/${id}/refund-request`, payload ?? {});
    const data = res.data;
    const order =
      data?.order ?? data?.data?.order ?? data?.data ?? data?.result?.order ?? data?.result ?? data;
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
        const list = Array.isArray(data)
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

    const candidates: Array<{
      key: 'orders_items' | 'orderitems_query' | 'orderitems_nested' | 'orderitems_id';
      url: string;
    }> = [
      { key: 'orders_items', url: `/orders/${order_ID}/items` },
      { key: 'orderitems_query', url: `/orderitems?order_ID=${order_ID}` },
      { key: 'orderitems_nested', url: `/orderitems/order/${order_ID}` },
      { key: 'orderitems_id', url: `/orderitems/${order_ID}` },
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get<any>(url.url);
        const data = res.data;
        const list = Array.isArray(data)
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

