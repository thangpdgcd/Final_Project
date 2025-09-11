import axios from "axios";

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

export interface UpdateOrderPayload extends Partial<CreateOrderPayload> {
  order_ID: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

// Lấy tất cả đơn hàng
export async function getAllOrders(): Promise<Order[]> {
  const res = await axios.get<Order[]>("http://localhost:8080/api/orders");
  return res.data;
}

// Lấy đơn hàng theo ID
export async function getOrderById(id: number): Promise<Order> {
  const res = await axios.get<Order>(`http://localhost:8080/api/orders/${id}`);
  return res.data;
}

// Lấy tất cả đơn hàng của 1 user
export async function getOrdersByUser(userId: number): Promise<Order[]> {
  const res = await axios.get<Order[]>(
    `http://localhost:8080/api/orders/user/${userId}`
  );
  return res.data;
}

// Tạo đơn hàng mới
export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiResponse<Order>> {
  const res = await axios.post<ApiResponse<Order>>(
    "http://localhost:8080/api/orders",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

// Cập nhật đơn hàng
export async function updateOrder(
  payload: UpdateOrderPayload
): Promise<ApiResponse<Order>> {
  const res = await axios.put<ApiResponse<Order>>(
    `http://localhost:8080/api/orders/${payload.order_ID}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

// Xóa đơn hàng
export async function deleteOrder(id: number): Promise<ApiResponse<null>> {
  const res = await axios.delete<ApiResponse<null>>(
    `http://localhost:8080/api/orders/${id}`
  );
  return res.data;
}
