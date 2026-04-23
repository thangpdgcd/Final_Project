import React from 'react';
import { CurrencyProvider } from '@/components/contexts/currencycontexts/CurrencyContext';
import { ShippingProvider } from '@/components/contexts/shippingcontexts/ShippingContext';

type ShopProvidersProps = {
  children: React.ReactNode;
};

const ShopProviders: React.FC<ShopProvidersProps> = ({ children }) => (
  <CurrencyProvider>
    <ShippingProvider>{children}</ShippingProvider>
  </CurrencyProvider>
);

export default ShopProviders;
