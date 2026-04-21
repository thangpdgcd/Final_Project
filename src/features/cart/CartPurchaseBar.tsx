import React from 'react';
import { Button, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

export type CartPurchaseBarProps = {
  cartCount: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  totalLabel: string;
  formattedTotal: string;
  discountLine?: React.ReactNode;
  savingsLine?: React.ReactNode;
  checkoutLabel: string;
  onCheckout: () => void;
  selectAllLabel: string;
  removeLabel: string;
  wishlistLabel: string;
};

export const CartPurchaseBar: React.FC<CartPurchaseBarProps> = ({
  cartCount,
  allSelected,
  onSelectAll,
  onClearSelection,
  totalLabel,
  formattedTotal,
  discountLine,
  savingsLine,
  checkoutLabel,
  onCheckout,
  selectAllLabel,
  removeLabel,
  wishlistLabel,
}) => {
  const onCheckAll = (e: CheckboxChangeEvent) => onSelectAll(e.target.checked);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.22)] dark:border-white/10 dark:shadow-[0_-12px_48px_rgba(0,0,0,0.55)]"
      style={{
        background:
          'linear-gradient(120deg, color-mix(in srgb, var(--hl-primary) 95%, #0c1222) 0%, color-mix(in srgb, var(--hl-primary-deep, var(--hl-primary)) 88%, #111827) 55%, color-mix(in srgb, var(--hl-primary) 80%, #1e293b) 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={allSelected}
                onChange={onCheckAll}
                disabled={cartCount === 0}
                className="[&_.ant-checkbox-inner]:border-white/80 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-white [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-white"
              />
              <span className="text-white/95">{selectAllLabel}</span>
            </label>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              onClick={onClearSelection}
            >
              {removeLabel}
            </button>
            <button
              type="button"
              className="hidden rounded-lg px-2 py-1 text-amber-100/95 transition-colors hover:bg-white/10 hover:text-amber-50 sm:inline"
            >
              {wishlistLabel}
            </button>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex flex-wrap items-baseline justify-end gap-2">
                <span className="text-sm text-white/90">{totalLabel}</span>
                <span className="text-xl font-bold text-white drop-shadow-sm">{formattedTotal}</span>
              </div>
              {discountLine}
              {savingsLine}
            </div>

            <Button
              type="primary"
              size="large"
              className="!h-12 min-w-[200px] !border-0 !bg-white !px-10 !font-bold !text-[color:var(--hl-primary)] shadow-lg transition-transform hover:!scale-[1.02] hover:!bg-amber-50 active:!scale-[0.98] dark:!text-[#0f172a]"
              onClick={onCheckout}
            >
              {checkoutLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

