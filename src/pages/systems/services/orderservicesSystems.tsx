// src/pages/systems/services/orderServicesSystem.ts
import {
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  type Order,
  type CreateOrderPayload,
} from "../../../api/orderApi";

// ✅ Type cho Form (UI dùng)
export type OrderFormValues = {
  user_ID: number;
  total_Amount: number;
  status?: string;
  shipping_Address?: string;
};

// ✅ default values khi tạo mới
export const getDefaultOrderValues = (): Partial<OrderFormValues> => ({
  status: "pending",
  total_Amount: 0,
});

// ✅ convert record -> form values
export const toOrderFormValues = (order: Order): OrderFormValues => ({
  user_ID: Number(order.user_ID),
  total_Amount: Number(order.total_Amount),
  status: order.status ?? "pending",
  shipping_Address: order.shipping_Address ?? "",
});

// ✅ build payload chuẩn cho API
export const buildOrderPayload = (values: any): CreateOrderPayload => ({
  user_ID: Number(values.user_ID),
  total_Amount: Number(values.total_Amount),
  status: String(values.status ?? "pending"),
  shipping_Address: String(values.shipping_Address ?? ""),
});

// ✅ helpers hiển thị
export const formatVND = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export const getStatusTagInfo = (status?: string) => {
  const s = (status ?? "pending").toLowerCase();
  let color: any = "gold";
  if (s === "paid" || s === "completed") color = "green";
  if (s === "cancelled" || s === "canceled") color = "volcano";
  if (s === "shipped") color = "blue";
  return { color, label: status || "pending" };
};

// ✅ API wrappers
export async function searchOrderByIdService(
  orderId: number
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  return order ?? null;
}

export async function createOrderService(values: any) {
  return createOrder(buildOrderPayload(values));
}

export async function updateOrderService(orderId: number, values: any) {
  return updateOrder(orderId, buildOrderPayload(values));
}

export async function deleteOrderService(orderId: number) {
  return deleteOrder(orderId);
}
