// src/pages/systems/pages/OrderManager.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

// Get display name for order user
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
      message.error("Failed to load orders.");
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
      message.success(`Found ${filtered.length} order(s)`);
    else message.info("No orders found for that name.");
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

  const handleEditOrder = useCallback((record: Order) => {
    setEditingOrder(record);
    form.resetFields();
    form.setFieldsValue(toOrderFormValues(record) as any);
    setIsModalOpen(true);
  }, [form]);

  const handleDeleteOrder = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await deleteOrderService(id);
      message.success("Order deleted.");
      await loadAllOrders();
    } catch {
      message.error("Failed to delete order.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setSaving(true);
      if (editingOrder) {
        await updateOrderService(editingOrder.order_ID, values);
        message.success("Updated successfully!.");
      } else {
        await createOrderService(values);
        message.success("Order created successfully.");
      }
      setIsModalOpen(false);
      await loadAllOrders();
    } catch {
      message.error("Failed to save order.");
    } finally {
      setSaving(false);
    }
  };

  /* ============ TABLE ============ */
  const columns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: "Customer",
        key: "user_name",
        render: (_: any, record: any) => getUserDisplayName(record),
      },
      {
        title: "Total",
        dataIndex: "total_Amount",
        render: (value: number) => formatVND(value),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status?: string) => {
          const { color, label } = getStatusTagInfo(status);
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: "Shipping address",
        dataIndex: "shipping_Address",
        ellipsis: true,
        render: (v?: string) => v || "-",
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_: any, record: Order) => (
          <Space>
            <Button
              size='small'
              icon={<EditOutlined />}
              onClick={() => handleEditOrder(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete order?"
              okText="Delete"
              cancelText="Cancel"
              onConfirm={() => handleDeleteOrder(record.order_ID)}>
              <Button danger size='small' icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleEditOrder, handleDeleteOrder]
  );

  return (
    <div className="system-manager">
      <h2 className="system-manager__title">
        🛒 System - Order Management
      </h2>

      <Card
        className="system-manager__panel"
        title={
          <span className="system-manager__toolbar-label">
            Order management ({orders.length})
          </span>
        }
        extra={
          <Space className="system-manager__toolbar-actions">
            <Input
              className="system-manager__search"
              placeholder="Search by customer name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
            />
            <Button icon={<SearchOutlined />} onClick={handleSearch}>
              Search
            </Button>
            <Button onClick={handleClearSearch}>Clear</Button>
            <Button icon={<ReloadOutlined />} onClick={loadAllOrders}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="system-manager__btn-add"
              onClick={handleAddOrder}
            >
              Add order
            </Button>
          </Space>
        }
      >
        <div className="system-manager__table">
          <Table
            rowKey="order_ID"
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>

      <Modal
        title={editingOrder ? "Edit order" : "Create order"}
        open={isModalOpen}
        onCancel={() => {
          if (!saving) setIsModalOpen(false);
        }}
        okText={editingOrder ? "Save" : "Create"}
        onOk={() => form.submit()}
        confirmLoading={saving}>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item label="Customer">
            <Input
              value={getUserDisplayName(editingOrder)}
              disabled
              placeholder="Customer name"
            />
          </Form.Item>

          <Form.Item
            label="Total (VND)"
            name="total_Amount"
            rules={[{ required: true, message: "Enter total amount" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Select status" }]}>
            <Select
              options={ORDER_STATUS_OPTIONS}
              placeholder="Select status..."
            />
          </Form.Item>

          <Form.Item label="Shipping address" name="shipping_Address">
            <TextArea rows={3} placeholder="Enter address..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManager;
