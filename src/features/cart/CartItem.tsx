import React from 'react';
import { motion } from 'framer-motion';
import type { CartItem as CartItemType } from '@/types/index';
import { CartItemCheckbox } from './cart-item/CartItemCheckbox';
import { CartItemProductInfo } from './cart-item/CartItemProductInfo';
import { CartItemUnitPrice } from './cart-item/CartItemUnitPrice';
import { CartItemQuantityControl } from './cart-item/CartItemQuantityControl';
import { CartItemAmount } from './cart-item/CartItemAmount';
import { CartItemActions } from './cart-item/CartItemActions';

interface Props {
  item: CartItemType;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onQtyChange: (item: CartItemType, delta: number) => void;
  onRemove: (id: number) => void;
  isRemoving: boolean;
}

const CartItem = React.forwardRef<HTMLDivElement, Props>(
  ({ item, selected, onSelect, onQtyChange, onRemove, isRemoving }, ref) => {
    const price = item.products?.price || item.price || 0;
    const linePrice = price * item.quantity;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
        className="bg-white dark:bg-[#1a1a1a] border-b border-stone-100 dark:border-stone-800 last:border-0"
      >
        <div className="flex items-center px-4 py-6 gap-4">
          <CartItemCheckbox checked={selected} onChange={onSelect} />

          <CartItemProductInfo item={item} />

          <CartItemUnitPrice price={price} />

          <CartItemQuantityControl item={item} onQtyChange={onQtyChange} disabled={isRemoving} />

          <CartItemAmount amount={linePrice} />

          <CartItemActions onRemove={() => onRemove(item.cartitem_ID)} removeDisabled={isRemoving} />
        </div>
      </motion.div>
    );
  },
);

CartItem.displayName = 'CartItem';

export default CartItem;

