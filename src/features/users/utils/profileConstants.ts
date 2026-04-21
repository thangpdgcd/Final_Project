export const formatPrice = (value: number, locale: string = 'vi-VN') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${Number(value) || 0}`;
  }
};

export const getWalletTransactionLabel = (
  typeRaw: string,
  labels: { topup: string; refund: string; spend: string; fallback: string },
) => {
  const type = String(typeRaw ?? '')
    .trim()
    .toUpperCase();
  if (!type) return labels.fallback;
  if (type.includes('TOPUP') || type.includes('DEPOSIT') || type.includes('ADD')) return labels.topup;
  if (type.includes('REFUND') || type.includes('RETURN')) return labels.refund;
  if (type.includes('SPEND') || type.includes('PAY') || type.includes('ORDER')) return labels.spend;
  return labels.fallback;
};

type Tokens = {
  bg: string;
  surfaceLow: string;
  surfaceHigh: string;
  surfaceLowest: string;
  onSurface: string;
  onSurfaceVariant: string;
  gold: string;
  goldDeep: string;
};

export const PROFILE_THEME_TOKENS: { light: Tokens; dark: Tokens } = {
  light: {
    bg: '#fff7ed',
    surfaceLow: '#ffffff',
    surfaceHigh: '#fffaf4',
    surfaceLowest: '#ffffff',
    onSurface: '#1c1917',
    onSurfaceVariant: '#57534e',
    gold: '#c18a2f',
    goldDeep: '#8a5a14',
  },
  dark: {
    bg: '#0b0b10',
    surfaceLow: '#14141b',
    surfaceHigh: '#1a1a23',
    surfaceLowest: '#0f0f16',
    onSurface: '#fafaf9',
    onSurfaceVariant: '#a8a29e',
    gold: '#fbbf24',
    goldDeep: '#fb923c',
  },
};

