import React, { useMemo } from 'react';
import { useCurrency } from '@/contexts/currencycontexts/CurrencyContext';
import type { PriceRangeFilterProps } from '@/types/shop/filters.types';

const clamp = (n: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, n));
};

const percent = (value: number, min: number, max: number) => {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
};

const PriceRangeFilter = ({ min, max, priceRange, setPriceRange }: PriceRangeFilterProps) => {
  const { format } = useCurrency() as any;

  const [minVal, maxVal] = priceRange;
  const leftPct = useMemo(() => percent(minVal, min, max), [minVal, min, max]);
  const rightPct = useMemo(() => percent(maxVal, min, max), [maxVal, min, max]);

  const onChangeMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(e.target.value), min, maxVal);
    setPriceRange([next, maxVal]);
  };

  const onChangeMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(e.target.value), minVal, max);
    setPriceRange([minVal, next]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="hl-sans text-sm font-medium text-[color:var(--hl-secondary)]">Price</div>
        <div className="hl-sans text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
          {format(minVal)} - {format(maxVal)}
        </div>
      </div>

      <div className="relative mt-5 pb-6">
        {/* Track */}
        <div className="h-2 rounded-full bg-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)]" />
        <div
          className="absolute top-0 h-2 rounded-full bg-[color:var(--hl-primary-container)]"
          style={{
            left: `${leftPct}%`,
            width: `${Math.max(0, rightPct - leftPct)}%`,
          }}
        />

        {/* Bubbles */}
        <div
          className="absolute -top-8 -translate-x-1/2 rounded-md bg-[color:var(--hl-surface-low)] px-2 py-1 text-xs font-semibold text-[color:var(--hl-primary)] shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)]"
          style={{ left: `${leftPct}%` }}
        >
          {format(minVal)}
        </div>
        <div
          className="absolute -top-8 -translate-x-1/2 rounded-md bg-[color:var(--hl-surface-low)] px-2 py-1 text-xs font-semibold text-[color:var(--hl-primary)] shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)]"
          style={{ left: `${rightPct}%` }}
        >
          {format(maxVal)}
        </div>

        {/* Dual sliders (stacked) */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={onChangeMin}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={onChangeMax}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          aria-label="Maximum price"
        />

        {/* Visible handles */}
        <div
          className="absolute top-1 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--hl-primary)] bg-[color:var(--hl-surface-lowest)] shadow"
          style={{ left: `calc(${leftPct}% - 8px)` }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--hl-primary)] bg-[color:var(--hl-surface-lowest)] shadow"
          style={{ left: `calc(${rightPct}% - 8px)` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
