import React, { useEffect, useState } from "react";
import { getAllOrders, Order } from "../../../api/orderApi";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error:", err.message));
  }, []);

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      {orders.map((o) => (
        <div key={o.order_ID}>
          <h3>Đơn hàng #{o.order_ID}</h3>
          <p>Người dùng: {o.user_ID}</p>
          <p>Tổng tiền: {o.total_Amount}đ</p>
          <p>Trạng thái: {o.status ?? "Chưa cập nhật"}</p>
          <p>Địa chỉ giao hàng: {o.shipping_Address ?? "Không có"}</p>
          <p>Ngày tạo: {new Date(o.createdAt ?? "").toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default OrderList;
