// src/api/orderApi.ts
import { http } from '@/services/api/http';

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

/* ================= ORDERS API (MATCH BE ROUTES) =================
BE:
GET    /api/orders
POST   /api/create-orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
*/

export async function getAllOrders(): Promise<Order[]> {
  const res = await http.get<Order[]>(`/orders`);
  return res.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await http.get<Order>(`/orders/${id}`);
  return res.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await http.post<Order>(`/create-orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function updateOrder(id: number, payload: Partial<Order>): Promise<Order> {
  const res = await http.put<Order>(`/orders/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteOrder(id: number): Promise<{ message: string }> {
  const res = await http.delete<{ message: string }>(`/orders/${id}`);
  return res.data;
}

/* ================= ORDER ITEMS API =================
⚠️ BE của bạn CHƯA show routes cho orderitems.
Các endpoint dưới đây chỉ dùng nếu backend bạn thật sự có:
GET    /api/orders/:order_ID/items
POST   /api/orderitems
DELETE /api/orderitems/:orderitem_ID
*/

export async function getOrderItemsByOrderId(order_ID: number): Promise<OrderItem[]> {
  const res = await http.get<OrderItem[]>(`/orders/${order_ID}/items`);
  return res.data;
}

export async function createOrderItem(payload: CreateOrderItemPayload): Promise<OrderItem> {
  const res = await http.post<OrderItem>(`/orderitems`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function deleteOrderItem(orderitem_ID: number): Promise<{ message: string }> {
  const res = await http.delete<{ message: string }>(`/orderitems/${orderitem_ID}`);
  return res.data;
}
