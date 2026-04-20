import React, { Suspense } from 'react';
import { Layout } from 'antd';
import HeaderPage from '@/components/layout/Header';
import FooterPage from '@/components/layout/Footer';
import { CustomerSupportWidget } from '@/features/customerSupportWidget';
import PageSpinner from '@/components/common/PageSpinner';
import AnimatedOutlet from '@/components/common/AnimatedOutlet';

const { Content } = Layout;

const CustomerLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <HeaderPage />
      <Content className="pt-24">
        <Suspense fallback={<PageSpinner />}>
          <AnimatedOutlet />
        </Suspense>
      </Content>
      <FooterPage />
      <CustomerSupportWidget />
    </Layout>
  );
};

export default CustomerLayout;
