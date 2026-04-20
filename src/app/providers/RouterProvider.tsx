import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, Spin, theme as antdTheme } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/store/ThemeContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AppRoutes from '@/routes';

const RouterProvider: React.FC = () => {
  const { dark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6f4e37',
          colorInfo: '#c4963b',
          borderRadius: 8,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <Spin size="large" tip="Loading page...">
                  <div style={{ minHeight: 24, minWidth: 24 }} />
                </Spin>
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme={dark ? 'dark' : 'light'} />
    </ConfigProvider>
  );
};

export default RouterProvider;

