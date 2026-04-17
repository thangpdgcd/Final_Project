import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type VoucherSummaryProps = {
  discount: number | null;
  finalPrice: number | null;
  message?: string;
  isSuccess?: boolean;
  formatPrice: (v: number) => string;
  onClear?: () => void;
};

export const VoucherSummary: React.FC<VoucherSummaryProps> = ({
  discount,
  finalPrice,
  message,
  isSuccess,
  formatPrice,
  onClear,
}) => {
  const hasData = useMemo(() => discount != null || finalPrice != null || Boolean(message), [discount, finalPrice, message]);
  if (!hasData) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={`mt-3 rounded-sm border px-4 py-3 ${
          isSuccess
            ? 'border-green-200 bg-green-50/60 dark:border-green-900/60 dark:bg-green-900/15'
            : 'border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-900/20'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isSuccess ? 'text-green-700 dark:text-green-400' : 'text-stone-800 dark:text-stone-100'}`}>
                {isSuccess ? 'Voucher applied' : 'Voucher result'}
              </span>
              {isSuccess && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white"
                >
                  SAVED
                </motion.span>
              )}
            </div>

            {message && (
              <div className={`mt-1 text-xs ${isSuccess ? 'text-green-700/90 dark:text-green-300/90' : 'text-stone-600 dark:text-stone-400'}`}>
                {message}
              </div>
            )}
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-sm bg-white/70 dark:bg-[#1f1f1f] border border-stone-100 dark:border-stone-800 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-stone-400">Discount</div>
            <div className="mt-0.5 text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatPrice(Number(discount ?? 0))}
            </div>
          </div>

          <div className="rounded-sm bg-white/70 dark:bg-[#1f1f1f] border border-stone-100 dark:border-stone-800 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-stone-400">Final price</div>
            <div className="mt-0.5 text-sm font-semibold text-orange-600">
              {formatPrice(Number(finalPrice ?? 0))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

