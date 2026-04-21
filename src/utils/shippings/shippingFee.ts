type ShippingFeeConfig = {
  freeThresholdVnd: number;
  feeVnd: number;
  expressFeeVnd: number;
};

const toInt = (v: unknown, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
};

export const getShippingFeeConfig = (): ShippingFeeConfig => {
  const feeVnd = toInt((import.meta as any).env?.VITE_SHIPPING_FEE_VND, 17000);
  const freeThresholdVnd = toInt((import.meta as any).env?.VITE_SHIPPING_FREE_THRESHOLD_VND, 200000);
  const expressFeeVnd = toInt((import.meta as any).env?.VITE_SHIPPING_EXPRESS_FEE_VND, 50000);
  return { feeVnd, freeThresholdVnd, expressFeeVnd };
};

export const calcShippingFeeVnd = (
  productsSubtotalVnd: number,
  shippingMethod: 'standard' | 'express' = 'standard',
): number => {
  const { feeVnd, freeThresholdVnd, expressFeeVnd } = getShippingFeeConfig();
  const subtotal = toInt(productsSubtotalVnd, 0);
  if (subtotal <= 0) return 0;
  if (shippingMethod === 'express') return expressFeeVnd;
  return subtotal >= freeThresholdVnd ? 0 : feeVnd;
};

