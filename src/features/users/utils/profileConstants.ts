export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

type WalletTransactionLabels = {
  topup: string;
  refund: string;
  spend: string;
  fallback: string;
};

export const getWalletTransactionLabel = (type: string, labels: WalletTransactionLabels) => {
  const normalizedType = String(type || '').toUpperCase();

  if (normalizedType === 'TOPUP') return labels.topup;
  if (normalizedType === 'REFUND') return labels.refund;
  if (normalizedType === 'SPEND') return labels.spend;

  return normalizedType || labels.fallback;
};

export const PROFILE_THEME_TOKENS = {
  dark: {
    bg: '#131313',
    surfaceLow: '#1c1b1b',
    surfaceLowest: '#0e0e0e',
    surfaceHigh: '#2a2a2a',
    onSurface: '#e5e2e1',
    onSurfaceVariant: '#d1c5b6',
    gold: '#e5c18b',
    goldDeep: '#c5a370',
    ringColor: '#131313',
  },
  light: {
    bg: '#faf8f5',
    surfaceLow: '#ffffff',
    surfaceLowest: '#f3f0ea',
    surfaceHigh: '#ede9e1',
    onSurface: '#1a0a00',
    onSurfaceVariant: '#5c3d2e',
    gold: '#b8892a',
    goldDeep: '#9a7020',
    ringColor: '#faf8f5',
  },
} as const;
