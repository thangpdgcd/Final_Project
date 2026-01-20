// src/pages/systems/services/orderServicesSystem.ts
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  type Order,
  type CreateOrderPayload,
} from "../../../api/orderApi";

/* ================= UI TYPES ================= */
export type OrderFormValues = {
  user_ID: number | string;
  total_Amount: number | string;
  status?: string;
  shipping_Address?: string;
};

/* ================= DEFAULTS ================= */
export const getDefaultOrderValues = (): Partial<OrderFormValues> => ({
  status: "pending",
  total_Amount: 0,
  shipping_Address: "",
});

/* ================= MAPPERS ================= */
// record -> form
export const toOrderFormValues = (order: Order): OrderFormValues => ({
  user_ID: order.user_ID,
  total_Amount: order.total_Amount,
  status: order.status ?? "pending",
  shipping_Address: order.shipping_Address ?? "",
});

// form -> create payload (đúng CreateOrderPayload)
export const buildCreateOrderPayload = (
  values: OrderFormValues
): CreateOrderPayload => ({
  user_ID: Number(values.user_ID),
  total_Amount: Number(values.total_Amount),
  status: String(values.status ?? "pending").trim(),
  shipping_Address: String(values.shipping_Address ?? "").trim(),
});

// form -> update payload (Partial<Order>) cho PUT /orders/:id
export const buildUpdateOrderPayload = (
  values: Partial<OrderFormValues>
): Partial<Order> => {
  const payload: Partial<Order> = {};

  if (values.user_ID !== undefined) payload.user_ID = Number(values.user_ID);
  if (values.total_Amount !== undefined)
    payload.total_Amount = Number(values.total_Amount);

  if (values.status !== undefined)
    payload.status = String(values.status).trim();
  if (values.shipping_Address !== undefined)
    payload.shipping_Address = String(values.shipping_Address).trim();

  return payload;
};

/* ================= UI HELPERS ================= */
export const formatVND = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export const getStatusTagInfo = (status?: string) => {
  const s = (status ?? "pending").toLowerCase();

  const colorMap: Record<string, string> = {
    pending: "gold",
    paid: "green",
    completed: "green",
    shipped: "blue",
    cancelled: "volcano",
    canceled: "volcano",
  };

  return {
    color: colorMap[s] || "default",
    label: status || "pending",
  };
};

/* ================= API WRAPPERS (match your API) ================= */

// ✅ GET ALL: GET `${apiBase}/orders`
export async function getAllOrdersService(): Promise<Order[]> {
  const orders = await getAllOrders();
  return Array.isArray(orders) ? orders : [];
}

// ✅ GET BY ID: GET `${apiBase}/orders/:id`
export async function searchOrderByIdService(
  orderId: number
): Promise<Order | null> {
  try {
    const order = await getOrderById(orderId);
    return order ?? null;
  } catch {
    return null;
  }
}

// ✅ CREATE: POST `${apiBase}/create-orders`
export async function createOrderService(values: OrderFormValues) {
  return createOrder(buildCreateOrderPayload(values));
}

// ✅ UPDATE: PUT `${apiBase}/orders/:id`
export async function updateOrderService(
  orderId: number,
  values: Partial<OrderFormValues>
) {
  return updateOrder(orderId, buildUpdateOrderPayload(values));
}

// ✅ DELETE: DELETE `${apiBase}/orders/:id`
export async function deleteOrderService(orderId: number) {
  return deleteOrder(orderId);
}
