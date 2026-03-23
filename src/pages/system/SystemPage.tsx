import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import AdminProductsTab from './components/AdminProductsTab';
import AdminOrdersTab from './components/AdminOrdersTab';
import AdminCategoriesTab from './components/AdminCategoriesTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminDashboardTab from './components/AdminDashboardTab';

const SystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, children: <AdminDashboardTab /> },
    { key: 'products', label: 'Sản phẩm', icon: <ShoppingOutlined />, children: <AdminProductsTab /> },
    { key: 'orders', label: 'Đơn hàng', icon: <UnorderedListOutlined />, children: <AdminOrdersTab /> },
    { key: 'categories', label: 'Danh mục', icon: <TagsOutlined />, children: <AdminCategoriesTab /> },
    { key: 'users', label: 'Người dùng', icon: <UserOutlined />, children: <AdminUsersTab /> },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs.map(t => ({ key: t.key, label: <span>{t.icon} {t.label}</span>, children: t.children }))}
        size="large"
      />
    </div>
  );
};

export default SystemPage;
