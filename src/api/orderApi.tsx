import axios from "axios";

/* --------- BASE URL --------- */
const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

/* --------- TYPES --------- */
export interface Order {
  order_ID: number;
  user_ID: number;
  total_Amount: number;
  status?: string;
  shipping_Address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  user_ID: number;
  total_Amount: number;
  status?: string;
  shipping_Address?: string;
}

export interface OrderItem {
  orderitem_ID: number;
  order_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItemPayload {
  order_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
}

/* ================= ORDER API ================= */

// ✅ Lấy đơn hàng theo ID
export const getOrderById = async (id: number): Promise<Order> => {
  const res = await axios.get<Order>(`${apiBase}/orders/${id}`);
  return res.data;
};

// ✅ Tạo đơn hàng mới
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<Order> => {
  const res = await axios.post<Order>(`${apiBase}/create-orders`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ Cập nhật đơn hàng
export const updateOrder = async (
  id: number,
  payload: Partial<Order>
): Promise<Order> => {
  const res = await axios.put<Order>(`${apiBase}/orders/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ Xoá đơn hàng
export const deleteOrder = async (id: number): Promise<{ message: string }> => {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/orders/${id}`
  );
  return res.data;
};

/* ================= ORDER ITEMS API ================= */

// ✅ Lấy tất cả order items theo order_ID
export const getOrderItemsByOrderId = async (
  order_ID: number
): Promise<OrderItem[]> => {
  const res = await axios.get<OrderItem[]>(
    `${apiBase}/orders/${order_ID}/items`
  );
  return res.data;
};

// ✅ Tạo order item mới
export const createOrderItem = async (
  payload: CreateOrderItemPayload
): Promise<OrderItem> => {
  const res = await axios.post<OrderItem>(`${apiBase}/orderitems`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ Xoá order item theo ID
export const deleteOrderItem = async (
  orderitem_ID: number
): Promise<{ message: string }> => {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/orderitems/${orderitem_ID}`
  );
  return res.data;
};
