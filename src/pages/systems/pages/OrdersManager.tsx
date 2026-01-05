import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Table,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import type { Order } from "../../../api/orderApi";

// ✅ Import service
import {
  searchOrderByIdService,
  createOrderService,
  updateOrderService,
  deleteOrderService,
  getDefaultOrderValues,
  toOrderFormValues,
  formatVND,
  getStatusTagInfo,
  type OrderFormValues,
} from "../services/orderservicesSystems";

const { TextArea } = Input;

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm<OrderFormValues>();

  const [searchId, setSearchId] = useState<number | null>(null);

  /* ============ SEARCH BY ID ============ */
  const handleSearchOrder = async () => {
    if (!searchId) {
      message.warning("Vui lòng nhập Order ID cần tìm!");
      return;
    }
    try {
      setLoading(true);
      const order = await searchOrderByIdService(searchId);
      if (order) {
        setOrders([order]);
        message.success("Đã tìm thấy đơn hàng!");
      } else {
        message.info("Không tìm thấy đơn hàng.");
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Search order error:", error);
      message.error("Không thể tìm thấy đơn hàng này!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============ OPEN MODAL CREATE ============ */
  const handleAddOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    form.setFieldsValue(getDefaultOrderValues() as any);
    setIsModalOpen(true);
  };

  /* ============ OPEN MODAL EDIT ============ */
  const handleEditOrder = (record: Order) => {
    setEditingOrder(record);
    form.resetFields();
    form.setFieldsValue(toOrderFormValues(record) as any);
    setIsModalOpen(true);
  };

  /* ============ DELETE ORDER ============ */
  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrderService(id);
      message.success("Đã xóa đơn hàng.");
      setOrders((prev) => prev.filter((o) => o.order_ID !== id));
    } catch (error: any) {
      console.error("Delete order error:", error);
      message.error("Xóa đơn hàng thất bại.");
    }
  };

  /* ============ SUBMIT FORM (CREATE / UPDATE) ============ */
  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setSaving(true);

      if (editingOrder) {
        await updateOrderService(editingOrder.order_ID, values);
        message.success("Cập nhật đơn hàng thành công.");
      } else {
        await createOrderService(values);
        message.success("Tạo đơn hàng mới thành công.");
      }

      setIsModalOpen(false);
      setOrders([]); // bạn đang muốn clear table sau khi thao tác
    } catch (error: any) {
      console.error("Save order error:", error);
      message.error("Lưu đơn hàng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  /* ============ TABLE COLUMNS ============ */
  const columns: ColumnsType<Order> = [
    { title: "Order ID", dataIndex: "order_ID", width: 100 },
    { title: "User ID", dataIndex: "user_ID", width: 100 },
    {
      title: "Tổng tiền",
      dataIndex: "total_Amount",
      width: 140,
      render: (value: number) => formatVND(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status?: string) => {
        const { color, label } = getStatusTagInfo(status);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shipping_Address",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_: any, record: Order) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEditOrder(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Xóa đơn hàng'
            description='Bạn chắc chắn muốn xóa đơn hàng này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDeleteOrder(record.order_ID)}>
            <Button danger size='small' icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title='Order Management (Search by ID)'
        extra={
          <Space>
            <InputNumber
              placeholder='Nhập Order ID...'
              min={1}
              value={searchId || undefined}
              onChange={(value) => setSearchId(value || null)}
              style={{ width: 180 }}
            />
            <Button
              type='default'
              icon={<SearchOutlined />}
              onClick={handleSearchOrder}>
              Tìm kiếm
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddOrder}>
              Thêm đơn hàng
            </Button>
          </Space>
        }>
        <Table
          rowKey='order_ID'
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText={editingOrder ? "Lưu" : "Tạo mới"}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnClose>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='User ID'
            name='user_ID'
            rules={[{ required: true, message: "Vui lòng nhập User ID!" }]}>
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder='ID người dùng'
            />
          </Form.Item>

          <Form.Item
            label='Tổng tiền (VND)'
            name='total_Amount'
            rules={[{ required: true, message: "Vui lòng nhập tổng tiền!" }]}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder='Tổng tiền đơn hàng'
            />
          </Form.Item>

          <Form.Item label='Trạng thái' name='status'>
            <Input placeholder='VD: pending, paid, shipped, cancelled...' />
          </Form.Item>

          <Form.Item label='Địa chỉ giao hàng' name='shipping_Address'>
            <TextArea rows={3} placeholder='Địa chỉ giao hàng' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManager;
