import React, { useEffect, useState } from "react";
import { Card, Tabs, List, Tag, Spin, Button, Modal } from "antd";
import { getAllOrders, getOrderById, Order } from "../../../api/orderApi";
import "./index.scss";

const { TabPane } = Tabs;

const statusColor: Record<string, string> = {
  Pending: "orange",
  Shipping: "blue",
  Completed: "green",
  Cancelled: "red",
};

const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🔹 Gọi API lấy tất cả đơn hàng khi load trang
  useEffect(() => {
    setLoading(true);
    getAllOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error getAllOrders:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Lọc đơn hàng theo trạng thái
  const filteredOrders =
    activeKey === "all" ? orders : orders.filter((o) => o.status === activeKey);

  // 🔹 Xem chi tiết đơn hàng theo ID
  const handleViewDetail = async (id: number) => {
    try {
      const order = await getOrderById(id);
      setSelectedOrder(order);
      setModalVisible(true);
    } catch (err: any) {
      console.error("Error getOrderById:", err.message);
    }
  };

  return (
    <Card title='📦 Đơn hàng của tôi' className='customer-orders'>
      <Tabs activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
        <TabPane tab='Tất cả' key='all' />
        <TabPane tab='Chờ xử lý' key='Pending' />
        <TabPane tab='Đang giao' key='Shipping' />
        <TabPane tab='Hoàn thành' key='Completed' />
        <TabPane tab='Đã hủy' key='Cancelled' />
      </Tabs>

      {loading ? (
        <Spin tip='Đang tải danh sách đơn hàng...' />
      ) : (
        <List
          itemLayout='horizontal'
          dataSource={filteredOrders}
          renderItem={(order) => (
            <List.Item
              actions={[
                <Button
                  type='link'
                  onClick={() => handleViewDetail(order.order_ID)}>
                  Xem chi tiết
                </Button>,
              ]}>
              <List.Item.Meta
                title={`Mã đơn: ${order.order_ID}`}
                description={`Người dùng: ${order.user_ID}`}
              />
              <div style={{ textAlign: "right" }}>
                <Tag color={statusColor[order.status ?? "Pending"]}>
                  {order.status ?? "Pending"}
                </Tag>
                <div>{order.total_Amount.toLocaleString()} đ</div>
              </div>
            </List.Item>
          )}
        />
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        open={modalVisible}
        title={`Chi tiết đơn hàng #${selectedOrder?.order_ID}`}
        footer={null}
        onCancel={() => setModalVisible(false)}>
        {selectedOrder ? (
          <div>
            <p>
              <b>Người dùng:</b> {selectedOrder.user_ID}
            </p>
            <p>
              <b>Tổng tiền:</b> {selectedOrder.total_Amount.toLocaleString()} đ
            </p>
            <p>
              <b>Trạng thái:</b> {selectedOrder.status ?? "Chưa cập nhật"}
            </p>
            <p>
              <b>Địa chỉ giao hàng:</b>{" "}
              {selectedOrder.shipping_Address ?? "Không có"}
            </p>
            <p>
              <b>Ngày tạo:</b>{" "}
              {new Date(selectedOrder.createdAt ?? "").toLocaleString()}
            </p>
          </div>
        ) : (
          <Spin tip='Đang tải chi tiết đơn hàng...' />
        )}
      </Modal>
    </Card>
  );
};

export default CustomerOrders;
