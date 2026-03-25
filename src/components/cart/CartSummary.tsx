import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '@/types';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

interface Props {
  items: CartItem[];
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const CartSummary: React.FC<Props> = ({ items, onCheckout, onContinueShopping }) => {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <div className="sticky top-28 rounded-3xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-[#1e1e1e]">
      <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-6 uppercase tracking-wider">
        Order Summary
      </h3>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-stone-600 dark:text-stone-400 overflow-hidden">
          <span>Subtotal ({totalItems} items)</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={total}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="font-medium text-stone-900 dark:text-stone-100"
            >
              {formatPrice(total)}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex justify-between text-stone-600 dark:text-stone-400">
          <span>Shipping</span>
          <span className="font-medium text-green-600 dark:text-green-400">Free</span>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-stone-200 dark:bg-stone-700" />
      
      <div className="flex justify-between items-end mb-8 overflow-hidden">
        <span className="text-base font-bold text-stone-900 dark:text-stone-100">Total</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={total}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-black text-orange-600 dark:text-orange-500"
          >
            {formatPrice(total)}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="space-y-3 mt-auto">
        <button
          onClick={onCheckout}
          className="w-full rounded-xl bg-orange-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-95 shadow-md hover:shadow-lg dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          Checkout Now →
        </button>
        <button
          onClick={onContinueShopping}
          className="w-full rounded-xl border-2 border-stone-200 px-4 py-3.5 text-sm font-bold text-stone-900 transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
