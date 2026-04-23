import React from 'react';
import { App as AntdApp } from 'antd';
import AppProviders from '@/app/providers/AppProviders';
import RouterProvider from '@/app/providers/RouterProvider';
import '@/styles/globalcss/globals.css';

const App: React.FC = () => {
  return (
    <AntdApp>
      <AppProviders>
        <RouterProvider />
      </AppProviders>
    </AntdApp>
  );
};

export default App;
