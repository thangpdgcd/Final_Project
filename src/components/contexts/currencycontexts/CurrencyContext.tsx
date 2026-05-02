import React, { createContext, useContext, useMemo, useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

type CurrencyContextValue = {
  selectedCurrency: string;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<string>>;
  format: (amountUSD: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const value = useMemo<CurrencyContextValue>(() => {
    const format = (amountUSD: number) => formatCurrency(amountUSD, selectedCurrency);
    return {
      selectedCurrency,
      setSelectedCurrency,
      format,
    };
  }, [selectedCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
