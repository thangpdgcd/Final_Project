import axiosInstance from '@/services/axios';
import type { Order, CreateOrderPayload, OrderItem, CreateOrderItemPayload } from '@/types';

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
    const res = await axiosInstance.post<Order>('/create-orders', payload);
    return res.data;
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
    const res = await axiosInstance.get<OrderItem[]>(`/orders/${order_ID}/items`);
    return res.data;
  },

  createItem: async (payload: CreateOrderItemPayload): Promise<OrderItem> => {
    const res = await axiosInstance.post<OrderItem>('/orderitems', payload);
    return res.data;
  },

  deleteItem: async (orderitem_ID: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/orderitems/${orderitem_ID}`);
    return res.data;
  },
};
