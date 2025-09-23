import React, { useEffect, useState } from "react";
import { getAllOrders, getOrderById, Order } from "../../../api/orderApi";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 🔹 Lấy tất cả đơn hàng khi load trang
  useEffect(() => {
    getAllOrders()
      .then((data) => {
        console.log("Orders API trả về:", data);
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error getAllOrders:", err.response?.data || err.message);
      });
  }, []);

  // 🔹 Xem chi tiết đơn hàng theo ID
  const handleViewDetail = async (id: number) => {
    try {
      const order = await getOrderById(id);
      setSelectedOrder(order);
    } catch (err: any) {
      console.error("Error:", err.message);
    }
  };

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>

      {orders.map((o) => (
        <div
          key={o.order_ID}
          style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
          <h3>Đơn hàng #{o.order_ID}</h3>
          <p>Người dùng: {o.user_ID}</p>
          <p>Tổng tiền: {o.total_Amount}đ</p>
          <p>Trạng thái: {o.status ?? "Chưa cập nhật"}</p>
          <p>Địa chỉ giao hàng: {o.shipping_Address ?? "Không có"}</p>
          <p>Ngày tạo: {new Date(o.createdAt ?? "").toLocaleString()}</p>
          <button onClick={() => handleViewDetail(o.order_ID)}>
            Xem chi tiết
          </button>
        </div>
      ))}

      {selectedOrder && (
        <div style={{ marginTop: 24, padding: 16, border: "2px solid #000" }}>
          <h2>Chi tiết đơn hàng #{selectedOrder.order_ID}</h2>
          <p>Người dùng: {selectedOrder.user_ID}</p>
          <p>Tổng tiền: {selectedOrder.total_Amount}đ</p>
          <p>Trạng thái: {selectedOrder.status ?? "Chưa cập nhật"}</p>
          <p>
            Địa chỉ giao hàng: {selectedOrder.shipping_Address ?? "Không có"}
          </p>
          <p>
            Ngày tạo: {new Date(selectedOrder.createdAt ?? "").toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
