// src/pages/systems/pages/OrderManager.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Order } from "../../../api/orderApi";
import {
  getAllOrdersService,
  searchOrderByIdService,
  createOrderService,
  updateOrderService,
  deleteOrderService,
  getDefaultOrderValues,
  toOrderFormValues,
  formatVND,
  getStatusTagInfo,
  type OrderFormValues,
} from "../../systems/services/orderservicesSystems";

const { TextArea } = Input;

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// ✅ lấy tên user
function getUserDisplayName(order: any): string {
  return (
    order?.users?.name ??
    order?.users?.fullName ??
    order?.users?.username ??
    "-"
  );
}

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm<OrderFormValues>();
  const [searchName, setSearchName] = useState<string>("");

  /* ============ LOAD ALL ============ */
  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersService();
      setOrders(data);
    } catch (err) {
      message.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllOrders();
  }, []);

  /* ============ SEARCH BY NAME ============ */
  const handleSearch = () => {
    const q = searchName.trim().toLowerCase();
    if (!q) {
      loadAllOrders();
      return;
    }

    const filtered = orders.filter((o: any) =>
      getUserDisplayName(o).toLowerCase().includes(q)
    );
    setOrders(filtered);

    if (filtered.length)
      message.success(`Tìm thấy ${filtered.length} đơn hàng`);
    else message.info("Không tìm thấy đơn hàng theo tên.");
  };

  const handleClearSearch = () => {
    setSearchName("");
    loadAllOrders();
  };

  /* ============ MODAL ============ */
  const handleAddOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    form.setFieldsValue(getDefaultOrderValues() as any);
    setIsModalOpen(true);
  };

  const handleEditOrder = (record: Order) => {
    setEditingOrder(record);
    form.resetFields();
    form.setFieldsValue(toOrderFormValues(record) as any);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      setLoading(true);
      await deleteOrderService(id);
      message.success("Đã xóa đơn hàng.");
      await loadAllOrders();
    } catch {
      message.error("Xóa đơn hàng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setSaving(true);
      if (editingOrder) {
        await updateOrderService(editingOrder.order_ID, values);
        message.success("Cập nhật đơn hàng thành công.");
      } else {
        await createOrderService(values);
        message.success("Tạo đơn hàng thành công.");
      }
      setIsModalOpen(false);
      await loadAllOrders();
    } catch {
      message.error("Lưu đơn hàng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  /* ============ TABLE ============ */
  const columns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: "Khách hàng",
        key: "user_name",
        render: (_: any, record: any) => getUserDisplayName(record),
      },
      {
        title: "Tổng tiền",
        dataIndex: "total_Amount",
        render: (value: number) => formatVND(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (status?: string) => {
          const { color, label } = getStatusTagInfo(status);
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: "Địa chỉ giao hàng",
        dataIndex: "shipping_Address",
        ellipsis: true,
        render: (v?: string) => v || "-",
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
    ],
    [orders]
  );

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Quản lý đơn hàng (${orders.length})`}
        extra={
          <Space>
            <Input
              placeholder='Tìm theo tên khách hàng...'
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Button icon={<SearchOutlined />} onClick={handleSearch}>
              Tìm
            </Button>
            <Button onClick={handleClearSearch}>Xóa tìm</Button>
            <Button icon={<ReloadOutlined />} onClick={loadAllOrders}>
              Làm mới
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
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng"}
        open={isModalOpen}
        onCancel={() => {
          if (!saving) setIsModalOpen(false);
        }}
        okText={editingOrder ? "Lưu" : "Tạo mới"}
        onOk={() => form.submit()}
        confirmLoading={saving}>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item label='Khách hàng'>
            <Input
              value={getUserDisplayName(editingOrder)}
              disabled
              placeholder='Tên khách hàng'
            />
          </Form.Item>

          <Form.Item
            label='Tổng tiền (VND)'
            name='total_Amount'
            rules={[{ required: true, message: "Nhập tổng tiền!" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label='Trạng thái'
            name='status'
            rules={[{ required: true, message: "Chọn trạng thái!" }]}>
            <Select
              options={ORDER_STATUS_OPTIONS}
              placeholder='Chọn trạng thái...'
            />
          </Form.Item>

          <Form.Item label='Địa chỉ giao hàng' name='shipping_Address'>
            <TextArea rows={3} placeholder='Nhập địa chỉ...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManager;
