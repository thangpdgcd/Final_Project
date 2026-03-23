import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { ShoppingOutlined, UnorderedListOutlined, TagsOutlined, CoffeeOutlined } from '@ant-design/icons';

const AdminDashboardTab: React.FC = () => {
  const { data: products = [], isLoading: pLoading } = useProducts();
  const { data: orders = [], isLoading: oLoading } = useOrders();
  const { data: categories = [] } = useCategories();

  if (pLoading || oLoading) return <div className="page-loading"><Spin /></div>;

  const totalRevenue = orders.reduce((s, o) => s + (o.total_Amount || 0), 0);

  const stats = [
    { title: 'Sản phẩm', value: products.length, icon: <ShoppingOutlined />, color: '#6f4e37' },
    { title: 'Đơn hàng', value: orders.length, icon: <UnorderedListOutlined />, color: '#c4963b' },
    { title: 'Danh mục', value: categories.length, icon: <TagsOutlined />, color: '#4e3524' },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalRevenue),
      icon: <CoffeeOutlined />,
      color: '#8b6347',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4e3524] dark:text-amber-100 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
        Tổng quan
      </h2>
      <Row gutter={[16, 16]}>
        {stats.map(s => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card bordered={false} className="rounded-xl shadow-md">
              <Statistic
                title={s.title}
                value={s.value}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboardTab;
