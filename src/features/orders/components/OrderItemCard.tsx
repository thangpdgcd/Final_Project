import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { getImageSrc } from '@/utils/image';
import { translatedProductName } from '@/utils/productI18n';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { OrderItemActions, OrderItemImage, type OrderItemRowAction } from './OrderItemActions';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

export type OrderItemCardProps = {
  raw: any;
  idx: number;
  orderId: number;
  productMap: Map<number, Product>;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewProduct: (productId: number) => void;
  onContactSeller: () => void;
  busyRowKey: string | null;
};

export const OrderItemCard = forwardRef<HTMLDivElement, OrderItemCardProps>(function OrderItemCard(
  { raw, idx, orderId, productMap, onBuyAgainItem, onViewProduct, onContactSeller, busyRowKey },
  ref,
) {
  const { t } = useAppTranslation();
  const productId = Number(
    raw?.product_ID ?? raw?.productId ?? raw?.products?.product_ID ?? raw?.products?.id,
  );
  const quantity = Number(raw?.quantity ?? 0);
  const unitPrice = Number(raw?.price ?? 0);
  const fallbackProduct =
    Number.isFinite(productId) && productId > 0 ? productMap.get(productId) : undefined;

  const apiName = String(raw?.products?.name ?? fallbackProduct?.name ?? '');
  const name =
    Number.isFinite(productId) && productId > 0
      ? translatedProductName(t, { product_ID: productId, name: apiName })
      : t('order.productFallback', { id: '—' });

  const image =
    raw?.products?.image ?? (fallbackProduct as any)?.image ?? (fallbackProduct as any)?.imageUrl;

  const rowKey = String(raw?.orderitem_ID ?? `${orderId}-${productId}-${idx}`);
  const qtySafe = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const canAct = Number.isFinite(productId) && productId > 0;

  const actionArgs: OrderItemRowAction = {
    rowKey,
    productId,
    quantity: qtySafe,
    price: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.42,
        delay: idx * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm ring-1 ring-stone-200/60 transition-shadow duration-300 hover:border-orange-200/70 hover:shadow-md hover:shadow-orange-500/[0.08] dark:border-stone-800 dark:bg-[#101010] dark:ring-stone-700/40 dark:hover:border-orange-900/50 dark:hover:shadow-orange-500/[0.06]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-[#ee4d2d]/[0.07] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-[#ee4d2d]/[0.12]" />

      <div className="relative flex items-center gap-3">
        <OrderItemImage imageUrl={image ? getImageSrc(image) : null} name={name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-stone-800 transition-colors group-hover:text-stone-900 dark:text-stone-100 dark:group-hover:text-white">
              {name}
            </p>
            <p className="flex-shrink-0 text-sm font-semibold text-[#ee4d2d]">
              {formatPrice(unitPrice)}
            </p>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 font-medium tabular-nums dark:bg-stone-800/80">
              ×{qtySafe}
            </span>
            <span className="font-semibold text-stone-700 dark:text-stone-200">
              {formatPrice(unitPrice * qtySafe)}
            </span>
          </div>
        </div>
      </div>

      <OrderItemActions
        canAct={canAct}
        busy={busyRowKey === rowKey}
        onBuyAgainItem={onBuyAgainItem}
        onViewProduct={onViewProduct}
        onContactSeller={onContactSeller}
        args={actionArgs}
      />
    </motion.div>
  );
});

OrderItemCard.displayName = 'OrderItemCard';
