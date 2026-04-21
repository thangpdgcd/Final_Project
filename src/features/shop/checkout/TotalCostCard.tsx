import { useMemo } from 'react';
import { useCurrency } from '@/contexts/currencycontexts/CurrencyContext';
import { useShipping } from '@/contexts/shippingcontexts/ShippingContext';
import type {
  CurrencyCtx,
  ShippingCtx,
  TotalCostCardProps,
} from '@/types/shop/checkout.types';

const TotalCostCard = ({ productSubtotalUSD }: TotalCostCardProps) => {
  const { selectedCurrency, format } = useCurrency() as CurrencyCtx;
  const { getShippingCostUSD, shippingMethod } = useShipping() as ShippingCtx;

  const shippingUSD = useMemo(
    () => getShippingCostUSD(selectedCurrency),
    [getShippingCostUSD, selectedCurrency, shippingMethod],
  );

  const totalUSD = productSubtotalUSD + shippingUSD;

  return (
    <div className="rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)] bg-[color:var(--hl-surface-lowest)] p-4 shadow-[var(--hl-ambient-shadow)]">
      <div className="hl-sans text-sm font-medium text-[color:var(--hl-secondary)]">Total cost</div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="hl-sans flex items-center justify-between text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">
          <span>Products</span>
          <span className="font-semibold text-[color:var(--hl-on-surface)]">
            {format(productSubtotalUSD)}
          </span>
        </div>
        <div className="hl-sans flex items-center justify-between text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">
          <span>Shipping</span>
          <span className="font-semibold text-[color:var(--hl-on-surface)]">
            {shippingUSD === 0 ? 'Free' : format(shippingUSD)}
          </span>
        </div>
        <div className="my-2 h-px bg-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)]" />
        <div className="hl-sans flex items-center justify-between">
          <span className="font-medium text-[color:var(--hl-on-surface)]">Total</span>
          <span className="text-lg font-bold text-[color:var(--hl-primary)]">
            {format(totalUSD)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalCostCard;
