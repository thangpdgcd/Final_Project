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
  // BE: GET /api/orders/orders/:id
  const res = await axios.get<Order>(`${apiBase}/orders/orders/${id}`);
  return res.data;
};

// ✅ Tạo đơn hàng mới
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<Order> => {
  // BE: POST /api/orders/create-orders
  const res = await axios.post<Order>(
    `${apiBase}/orders/create-orders`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
};

// ✅ Cập nhật đơn hàng
export const updateOrder = async (
  id: number,
  payload: Partial<Order>
): Promise<Order> => {
  // BE: PUT /api/orders/orders/:id
  const res = await axios.put<Order>(
    `${apiBase}/orders/orders/${id}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
};

// ✅ Xoá đơn hàng
export const deleteOrder = async (id: number): Promise<{ message: string }> => {
  // BE: DELETE /api/orders/orders/:id
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/orders/orders/${id}`
  );
  return res.data;
};

/* ================= ORDER ITEMS API =================
   ⚠️ Phần này chỉ đúng nếu BE của bạn thật sự có các routes dưới đây.
   Nếu BE chưa có /orders/:order_ID/items hoặc /orderitems... thì sẽ 404.
*/

// ✅ Lấy tất cả order items theo order_ID
export const getOrderItemsByOrderId = async (
  order_ID: number
): Promise<OrderItem[]> => {
  // giả định BE: GET /api/orders/orders/:order_ID/items
  const res = await axios.get<OrderItem[]>(
    `${apiBase}/orders/orders/${order_ID}/items`
  );
  return res.data;
};

// ✅ Tạo order item mới
export const createOrderItem = async (
  payload: CreateOrderItemPayload
): Promise<OrderItem> => {
  // giả định BE: POST /api/orders/orderitems
  const res = await axios.post<OrderItem>(
    `${apiBase}/orders/orderitems`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
};

// ✅ Xoá order item theo ID
export const deleteOrderItem = async (
  orderitem_ID: number
): Promise<{ message: string }> => {
  // giả định BE: DELETE /api/orders/orderitems/:orderitem_ID
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/orders/orderitems/${orderitem_ID}`
  );
  return res.data;
};
