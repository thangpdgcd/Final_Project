import axios from "axios";

const apiorder =
  process.env.REACT_APP_API_URL_ORDER || "http://localhost:8080/api/orders";

export interface Order {
  order_ID: number;
  user_ID: number;
  total_Amount: number;
  status?: string;
  shipping_Address?: string;
  createdAt?: string;
}

// ✅ Lấy tất cả đơn hàng (GET)
export const getAllOrders = async (): Promise<Order[]> => {
  const res = await axios.get<Order[]>(apiorder);
  console.log(res.data);
  return res.data;
};

// ✅ Lấy đơn hàng theo ID
export const getOrderById = async (orderId: number): Promise<Order> => {
  const res = await axios.get(apiorder, {
    params: { orderId },
  });
  return res.data;
};

// ✅ Tạo đơn hàng mới (POST)
export const createOrder = async (payload: Order): Promise<Order> => {
  const res = await axios.post<Order>(apiorder, payload);
  return res.data;
};

// ✅ Cập nhật đơn hàng (PUT)
export const updateOrder = async (
  id: number,
  payload: Partial<Order>
): Promise<Order> => {
  const res = await axios.put<Order>(`${apiorder}/${id}`, payload);
  return res.data;
};

// ✅ Xoá đơn hàng (DELETE)
export const deleteOrder = async (id: number): Promise<void> => {
  await axios.delete(`${apiorder}/${id}`);
};
