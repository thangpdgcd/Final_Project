import type { CartItem as CartItemType } from '@/types';

export function CartItemQuantityControl({
  item,
  onQtyChange,
  disabled,
}: {
  item: CartItemType;
  onQtyChange: (item: CartItemType, delta: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="w-24 md:w-32 flex justify-center">
      <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 border-r border-stone-200 dark:border-stone-800"
          onClick={() => onQtyChange(item, -1)}
          disabled={disabled}
          aria-label={item.quantity <= 1 ? 'Xóa khỏi giỏ hàng' : 'Giảm số lượng'}
        >
          −
        </button>
        <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-stone-900 dark:text-stone-100">
          {item.quantity}
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 border-l border-stone-200 dark:border-stone-800"
          onClick={() => onQtyChange(item, 1)}
          disabled={disabled}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

