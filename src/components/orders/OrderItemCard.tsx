import React, { useMemo } from 'react';
import type { Product } from '@/types/index';
import { OrderItemActions, type OrderItemRowAction } from './OrderItemActions';
import { getImageSrc } from '@/utils/images/image';

type Props = {
  raw: any;
  idx: number;
  orderId: number;
  productMap: Map<number, Product>;
  busyRowKey: string | null;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewOrder: (orderId: number) => void;
  onContactSeller: () => void;
};

export const OrderItemCard = React.forwardRef<HTMLDivElement, Props>(({
  raw,
  idx,
  orderId,
  productMap,
  busyRowKey,
  onBuyAgainItem,
  onViewOrder,
  onContactSeller,
}, ref) => {
  const productId = Number(raw?.product_ID ?? raw?.productId ?? raw?.id ?? 0);
  const quantity = Number(raw?.quantity ?? 0) || 0;
  const price = Number(raw?.price ?? raw?.unitPrice ?? 0) || 0;
  const rowKey = String(raw?.orderitem_ID ?? raw?.orderItemId ?? `${productId}-${idx}`);

  const product = useMemo(() => (productId ? productMap.get(productId) : undefined), [productId, productMap]);
  const title = String(product?.name ?? raw?.name ?? `#${productId || idx + 1}`);
  const image = (product as any)?.image ?? raw?.image ?? raw?.products?.image ?? raw?.product?.image;
  const busy = busyRowKey === rowKey;

  return (
    <div
      ref={ref}
      className="rounded-xl border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_20%,transparent)] bg-[color:var(--hl-surface-lowest)] p-4"
    >
      <div className="flex items-start gap-3">
        <img
          src={getImageSrc(image)}
          alt={title}
          className="h-14 w-14 shrink-0 rounded-lg border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-low)] object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/no-image.png';
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[color:var(--hl-on-surface)]">{title}</div>
          <div className="mt-1 text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
            Qty: {quantity} • Price: {price.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <OrderItemActions
        canAct={productId > 0 && quantity > 0}
        busy={busy}
        args={{ productId, quantity, price, rowKey }}
        onBuyAgainItem={onBuyAgainItem}
        onViewOrder={() => onViewOrder(orderId)}
        onContactSeller={onContactSeller}
      />
    </div>
  );
});

OrderItemCard.displayName = 'OrderItemCard';

