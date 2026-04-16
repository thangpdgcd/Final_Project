import React from 'react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ShippingProvider } from '@/contexts/ShippingContext';

type ShopProvidersProps = {
  children: React.ReactNode;
};

const ShopProviders: React.FC<ShopProvidersProps> = ({ children }) => (
  <CurrencyProvider>
    <ShippingProvider>{children}</ShippingProvider>
  </CurrencyProvider>
);

export default ShopProviders;

