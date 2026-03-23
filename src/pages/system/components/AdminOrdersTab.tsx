import React from 'react';
import { Table, Tag } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const columns: ColumnsType<Order> = [
  { title: 'ID', dataIndex: 'order_ID', width: 70 },
  { title: 'User ID', dataIndex: 'user_ID' },
  { title: 'Tổng tiền', dataIndex: 'total_Amount', render: (v: number) => formatPrice(v) },
  { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <Tag color={s === 'Paid' ? 'green' : 'orange'}>{s || 'Pending'}</Tag> },
  { title: 'Thanh toán', dataIndex: 'paymentMethod' },
  { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
];

const AdminOrdersTab: React.FC = () => {
  const { data: orders = [], isLoading } = useOrders();
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#4e3524] mb-4">Danh sách đơn hàng</h3>
      <Table columns={columns} dataSource={orders} rowKey="order_ID" loading={isLoading} />
    </div>
  );
};

export default AdminOrdersTab;
