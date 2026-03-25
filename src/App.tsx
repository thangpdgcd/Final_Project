import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, theme as antdTheme } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from '@/store/ThemeContext';
import { AuthProvider } from '@/store/AuthContext';
import AppRoutes from '@/routes';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppContent: React.FC = () => {
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
              <div
                style={{
                  minHeight: '100vh',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={dark ? 'dark' : 'light'}
      />
    </ConfigProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
