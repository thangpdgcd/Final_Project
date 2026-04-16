export type CurrencyCtx = {
  selectedCurrency: string;
  format: (amountUSD: number) => string;
};

export type ShippingMethodId = 'standard' | 'express';

export type ShippingOption = {
  id: ShippingMethodId;
  label: string;
  daysMin: number;
  daysMax: number;
};

export type ShippingCtx = {
  shippingMethod: ShippingMethodId;
  setShippingMethod: (id: ShippingMethodId) => void;
  methods: Record<ShippingMethodId, ShippingOption>;
  getEstimateText: () => string;
  getShippingCostUSD: (currency: string) => number;
};

export type TotalCostCardProps = {
  productSubtotalUSD: number;
};

