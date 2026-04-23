import React from 'react';
import { useCurrency } from '@/components/contexts/currencycontexts/CurrencyContext';

const CurrencySwitcher = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency() as any;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="hl-sans text-sm font-medium text-[color:var(--hl-secondary)]">Currency</div>
      <select
        value={selectedCurrency}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCurrency(e.target.value)}
        className="rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] bg-[color:var(--hl-surface-low)] px-3 py-2 text-sm text-[color:var(--hl-on-surface)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--hl-primary)_35%,transparent)]"
      >
        <option value="USD">USD</option>
        <option value="VND">VND</option>
      </select>
    </div>
  );
};

export default CurrencySwitcher;
