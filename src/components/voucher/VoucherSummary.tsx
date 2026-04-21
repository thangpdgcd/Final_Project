import React from 'react';

type Props = {
  discount: number | null;
  finalPrice: number | null;
  message?: string | null;
  isSuccess?: boolean;
  formatPrice: (value: number) => string;
  onClear?: () => void;
};

const VoucherSummary: React.FC<Props> = ({
  discount,
  finalPrice,
  message,
  isSuccess = false,
  formatPrice,
  onClear,
}) => {
  const hasDiscount = typeof discount === 'number' && Number.isFinite(discount) && discount > 0;
  const hasFinal = typeof finalPrice === 'number' && Number.isFinite(finalPrice) && finalPrice >= 0;
  const hasMessage = Boolean(message && String(message).trim());

  if (!hasDiscount && !hasFinal && !hasMessage) return null;

  return (
    <div className="mt-3 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-low))] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {hasMessage ? (
            <p className={['text-sm', isSuccess ? 'text-emerald-700' : 'text-stone-600'].join(' ')}>
              {String(message)}
            </p>
          ) : null}
          {hasDiscount ? (
            <p className="mt-1 text-xs text-emerald-700">
              Discount: -{formatPrice(Number(discount))}
            </p>
          ) : null}
          {hasFinal ? (
            <p className="mt-1 text-xs text-stone-700">
              Final: <span className="font-semibold">{formatPrice(Number(finalPrice))}</span>
            </p>
          ) : null}
        </div>

        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default VoucherSummary;

