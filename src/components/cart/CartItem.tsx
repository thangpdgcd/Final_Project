import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from 'antd';
import type { CartItem as CartItemType } from '@/types';
import { getImageSrc } from '@/utils/image';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

interface Props {
  item: CartItemType;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onQtyChange: (item: CartItemType, delta: number) => void;
  onRemove: (id: number) => void;
  isRemoving: boolean;
}

const CartItem: React.FC<Props> = ({ item, selected, onSelect, onQtyChange, onRemove, isRemoving }) => {
  const price = item.products?.price || item.price || 0;
  const linePrice = price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-[#1a1a1a] border-b border-stone-100 dark:border-stone-800 last:border-0"
    >
      <div className="flex items-center px-4 py-6 gap-4">
        {/* Checkbox */}
        <div className="flex items-center justify-center w-8">
          <Checkbox checked={selected} onChange={(e) => onSelect(e.target.checked)} />
        </div>

        {/* Product Info */}
        <div className="flex flex-1 gap-4 min-w-0">
          <img
            src={getImageSrc(item.products?.image)}
            alt={item.products?.name || ''}
            className="h-20 w-20 rounded-lg object-cover bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-800"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
          />
          <div className="flex flex-col flex-1 min-w-0 pr-4">
            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
              {item.products?.name || `Product #${item.product_ID}`}
            </h3>
            <div className="mt-2 inline-flex items-center text-[10px] sm:text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-800 w-fit">
              Miễn phí trả hàng 15 ngày
            </div>
          </div>
        </div>

        {/* Unit Price */}
        <div className="hidden md:block w-24 text-center">
          <span className="text-sm text-stone-500 dark:text-stone-400 line-through block opacity-50">
            {formatPrice(price * 1.2)}
          </span>
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {formatPrice(price)}
          </span>
        </div>

        {/* Quantity */}
        <div className="w-24 md:w-32 flex justify-center">
          <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded">
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 border-r border-stone-200 dark:border-stone-800"
              onClick={() => onQtyChange(item, -1)}
              disabled={isRemoving || item.quantity <= 1}
            >
              −
            </button>
            <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-stone-900 dark:text-stone-100">
              {item.quantity}
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 border-l border-stone-200 dark:border-stone-800"
              onClick={() => onQtyChange(item, 1)}
              disabled={isRemoving}
            >
              +
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="hidden sm:block w-28 text-center">
          <span className="text-sm font-bold text-orange-600 dark:text-orange-500">
            {formatPrice(linePrice)}
          </span>
        </div>

        {/* Actions */}
        <div className="w-16 flex flex-col items-center gap-1">
          <button
            onClick={() => onRemove(item.cartitem_ID)}
            className="text-xs text-stone-900 dark:text-stone-100 hover:text-orange-600 transition-colors"
          >
            Xóa
          </button>
          <button className="text-[10px] text-orange-600 hover:underline">
            Tìm sản phẩm tương tự
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
