import { Coffee, Eye, Loader2, MessageCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export type OrderItemRowAction = {
  productId: number;
  quantity: number;
  price: number;
  rowKey: string;
};

const btnTransition = { type: 'spring' as const, stiffness: 420, damping: 28 };

export function OrderItemActions({
  canAct,
  busy,
  onBuyAgainItem,
  onViewProduct,
  onContactSeller,
  args,
}: {
  canAct: boolean;
  busy: boolean;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewProduct: (productId: number) => void;
  onContactSeller: () => void;
  args: OrderItemRowAction;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.08 }}
      className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-200 pt-3 dark:border-stone-800"
    >
      <motion.button
        type="button"
        disabled={!canAct || busy}
        onClick={() => canAct && !busy && onBuyAgainItem(args)}
        whileHover={canAct && !busy ? { scale: 1.03, y: -1 } : undefined}
        whileTap={canAct && !busy ? { scale: 0.97 } : undefined}
        transition={btnTransition}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ee4d2d] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 transition-shadow hover:bg-[#d73211] hover:shadow-lg hover:shadow-orange-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee4d2d] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 sm:text-sm"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
        Mua lại
      </motion.button>
      <motion.button
        type="button"
        disabled={!canAct}
        onClick={() => canAct && onViewProduct(args.productId)}
        whileHover={canAct ? { scale: 1.03, y: -1 } : undefined}
        whileTap={canAct ? { scale: 0.97 } : undefined}
        transition={btnTransition}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white/80 px-3 py-2 text-xs font-medium text-stone-700 backdrop-blur-sm transition-colors hover:border-[#ee4d2d]/40 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-200 dark:hover:border-orange-500/35 dark:hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
      >
        <Eye className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        Xem chi tiết
      </motion.button>
      <motion.button
        type="button"
        onClick={onContactSeller}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={btnTransition}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white/80 px-3 py-2 text-xs font-medium text-stone-700 backdrop-blur-sm transition-colors hover:border-[#ee4d2d]/40 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-200 dark:hover:border-orange-500/35 dark:hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 sm:text-sm"
      >
        <MessageCircle className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        Liên hệ người bán
      </motion.button>
    </motion.div>
  );
}

export function OrderItemImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <motion.div
      className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
      whileHover={{ scale: 1.06 }}
      transition={btnTransition}
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-orange-500/0 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-white/5" />
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Coffee className="text-stone-300 transition-transform duration-300 group-hover:scale-110 dark:text-stone-600" size={22} />
        </div>
      )}
    </motion.div>
  );
}

