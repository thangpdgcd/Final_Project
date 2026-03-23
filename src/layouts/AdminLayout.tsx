import React, { Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Spin, Avatar, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  TagsOutlined,
  LogoutOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const MENU_ITEMS = [
  { key: '/system/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/system/products', icon: <ShoppingOutlined />, label: 'Products' },
  { key: '/system/orders', icon: <UnorderedListOutlined />, label: 'Orders' },
  { key: '/system/categories', icon: <TagsOutlined />, label: 'Categories' },
  { key: '/system/users', icon: <UserOutlined />, label: 'Users' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        theme={dark ? 'dark' : 'light'}
        width={220}
        className="admin-sider"
        style={{
          background: dark ? '#1a0a00' : '#fff8f0',
          borderRight: '1px solid rgba(111,78,55,0.15)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-4 py-5 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <CoffeeOutlined style={{ color: '#6f4e37', fontSize: 22 }} />
          <Text strong style={{ color: '#6f4e37', fontSize: 16, fontFamily: 'var(--font-display)' }}>
            Phan Coffee
          </Text>
          <Badge count="Admin" color="#c4963b" />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          theme={dark ? 'dark' : 'light'}
          items={MENU_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none' }}
        />

        {/* Logout at bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogoutOutlined /> Sign Out
          </button>
        </div>
      </Sider>

      <Layout>
        <Header
          className="admin-topbar"
          style={{
            background: dark ? '#231608' : '#fff',
            borderBottom: '1px solid rgba(111,78,55,0.12)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 16,
          }}
        >
          <button onClick={toggleDark} className="user-icon-btn">
            {dark ? <SunOutlined /> : <MoonOutlined />}
          </button>
          <div className="flex items-center gap-2">
            <Avatar size="small" style={{ background: '#6f4e37' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Text>{user?.name || 'Admin'}</Text>
          </div>
        </Header>
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Suspense fallback={<div className="page-loading"><Spin size="large" /></div>}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
