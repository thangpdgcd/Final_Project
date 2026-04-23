import { useCurrency } from '@/components/contexts/currencycontexts/CurrencyContext';
import { useShipping } from '@/components/contexts/shippingcontexts/ShippingContext';
import type { CurrencyCtx, ShippingCtx } from '@/types/shop/checkout.types';

const ShippingMethod = () => {
  const { selectedCurrency, format } = useCurrency() as CurrencyCtx;
  const { shippingMethod, setShippingMethod, methods, getEstimateText, getShippingCostUSD } =
    useShipping() as ShippingCtx;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="hl-sans text-sm font-medium text-[color:var(--hl-secondary)]">Shipping</div>
        <div className="hl-sans text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
          ETA: {getEstimateText()}
        </div>
      </div>

      <div className="space-y-2">
        {Object.values(methods).map((m) => {
          const usdCost = m.id === 'express' ? getShippingCostUSD(selectedCurrency) : 0;
          const costLabel = m.id === 'standard' ? 'Free' : `+ ${format(usdCost)}`;

          return (
            <label
              key={m.id}
              className={[
                'flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-3',
                shippingMethod === m.id
                  ? 'border-[color:color-mix(in_srgb,var(--hl-primary)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--hl-primary)_08%,transparent)]'
                  : 'border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-low)] hover:bg-[color:var(--hl-surface-lowest)]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={m.id}
                  checked={shippingMethod === m.id}
                  onChange={() => setShippingMethod(m.id)}
                  className="accent-[color:var(--hl-primary)]"
                />
                <div>
                  <div className="hl-sans text-sm text-[color:var(--hl-on-surface)]">{m.label}</div>
                  <div className="hl-sans text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
                    {m.daysMin}-{m.daysMax} days
                  </div>
                </div>
              </div>
              <div className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)]">
                {costLabel}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingMethod;
