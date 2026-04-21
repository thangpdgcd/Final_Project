import React from 'react';
import { CurrencyProvider } from '@/contexts/currencycontexts/CurrencyContext';
import { ShippingProvider } from '@/contexts/shippingcontexts/ShippingContext';

type ShopProvidersProps = {
  children: React.ReactNode;
};

const ShopProviders: React.FC<ShopProvidersProps> = ({ children }) => (
  <CurrencyProvider>
    <ShippingProvider>{children}</ShippingProvider>
  </CurrencyProvider>
);

export default ShopProviders;
