import React, { createContext, useContext, useMemo, useState } from 'react';
import { getUsdToVndRate } from '@/utils/formatCurrency';

type ShippingMethodId = 'standard' | 'express';

type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  usdCost: number;
  vndCost?: number;
  daysMin: number;
  daysMax: number;
};

type ShippingContextValue = {
  shippingMethod: ShippingMethodId;
  setShippingMethod: React.Dispatch<React.SetStateAction<ShippingMethodId>>;
  method: ShippingMethod;
  getShippingCostUSD: (currency: string) => number;
  getEstimateText: () => string;
  methods: Record<ShippingMethodId, ShippingMethod>;
};

const ShippingContext = createContext<ShippingContextValue | null>(null);

const METHODS: Record<ShippingMethodId, ShippingMethod> = {
  standard: {
    id: 'standard',
    label: 'Standard',
    usdCost: 0,
    daysMin: 4,
    daysMax: 6,
  },
  express: {
    id: 'express',
    label: 'Express',
    usdCost: 2,
    vndCost: 50000,
    daysMin: 1,
    daysMax: 2,
  },
};

export function ShippingProvider({ children }: { children: React.ReactNode }) {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('standard');

  const value = useMemo<ShippingContextValue>(() => {
    const method = METHODS[shippingMethod] ?? METHODS.standard;

    const getShippingCostUSD = (currency: string) => {
      if (method.id !== 'express') return 0;
      if (currency === 'VND') return (method.vndCost ?? 0) / getUsdToVndRate();
      return method.usdCost;
    };

    const getEstimateText = () => {
      const now = new Date();
      const min = new Date(now);
      const max = new Date(now);
      min.setDate(now.getDate() + method.daysMin);
      max.setDate(now.getDate() + method.daysMax);

      const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${fmt(min)} - ${fmt(max)}`;
    };

    return {
      shippingMethod,
      setShippingMethod,
      method,
      getShippingCostUSD,
      getEstimateText,
      methods: METHODS,
    };
  }, [shippingMethod]);

  return <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>;
}

export function useShipping() {
  const ctx = useContext(ShippingContext);
  if (!ctx) throw new Error('useShipping must be used within ShippingProvider');
  return ctx;
}

