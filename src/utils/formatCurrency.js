const USD_TO_VND = 24000;

const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const formatVND = (amount) => {
  const rounded = Math.round(amount);
  const digits = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${digits}₫`;
}

export const formatCurrency = (amountUSD, currency) => {
  if (currency === 'VND') return formatVND(amountUSD * USD_TO_VND);
  return formatUSD(amountUSD);
}

export const convertUSD = (amountUSD, currency) => {
  if (currency === 'VND') return amountUSD * USD_TO_VND;
  return amountUSD;
}

export const getUsdToVndRate = () => {
  return USD_TO_VND;
}

