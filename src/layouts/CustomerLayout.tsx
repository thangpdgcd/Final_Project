import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import HeaderPage from '@/components/layout/Header';
import FooterPage from '@/components/layout/Footer';
import { CustomerSupportWidget } from '@/features/customerSupportWidget';

const { Content } = Layout;

const CustomerLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <HeaderPage />
      <Content className="pt-24">
        <Suspense
          fallback={
            <div className="page-loading">
              <Spin size="large" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </Content>
      <FooterPage />
      <CustomerSupportWidget />
    </Layout>
  );
};

export default CustomerLayout;
