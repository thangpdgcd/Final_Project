import React, { useMemo } from 'react';

type VoucherInputProps = {
  code: string;
  onCodeChange: (v: string) => void;
  onApply: (trimmedCode: string) => void;
  isApplying: boolean;
  errorMessage?: string;
  helperText?: string;
  autoFocus?: boolean;
};

export const VoucherInput: React.FC<VoucherInputProps> = ({
  code,
  onCodeChange,
  onApply,
  isApplying,
  errorMessage,
  helperText,
  autoFocus,
}) => {
  const trimmed = useMemo(() => code.trim(), [code]);
  const disabled = isApplying || !trimmed;

  return (
    <div className="rounded-sm border border-stone-100 dark:border-stone-800 bg-white dark:bg-[#1a1a1a] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Voucher code</div>
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Apply a voucher to save on this order.
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            value={code}
            autoFocus={autoFocus}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (disabled) return;
              onApply(trimmed);
            }}
            placeholder="Enter voucher code (e.g. WELCOME50K)"
            className={`w-full rounded-sm border bg-white dark:bg-[#222] px-3 py-2 text-sm outline-none placeholder:text-stone-400 ${
              errorMessage
                ? 'border-red-300 focus:border-red-400'
                : 'border-stone-200 dark:border-stone-800 focus:border-orange-500'
            }`}
          />
          {(errorMessage || helperText) && (
            <div
              className={`mt-1 text-xs ${errorMessage ? 'text-red-600' : 'text-stone-500 dark:text-stone-400'}`}
            >
              {errorMessage || helperText}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(trimmed)}
          className={`h-10 rounded-sm px-5 text-sm font-semibold transition-all ${
            disabled
              ? 'cursor-not-allowed bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
              : 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-700'
          }`}
        >
          {isApplying ? 'Applying…' : 'Apply Voucher'}
        </button>
      </div>
    </div>
  );
};
