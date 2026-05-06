import React from 'react';
import { useTranslation } from 'react-i18next';

export type OrderItemRowAction = {
  productId: number;
  quantity: number;
  price: number;
  rowKey: string;
};

type Props = {
  canAct: boolean;
  busy: boolean;
  args: OrderItemRowAction;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewOrder: () => void;
  onContactSeller: () => void;
};

export const OrderItemActions: React.FC<Props> = ({
  canAct,
  busy,
  args,
  onBuyAgainItem,
  onViewOrder,
  onContactSeller,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!canAct || busy}
        onClick={() => onBuyAgainItem(args)}
        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {t('order.buyAgain')}
      </button>
      <button
        type="button"
        onClick={onViewOrder}
        className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
      >
        {t('order.viewDetails')}
      </button>
      <button
        type="button"
        onClick={onContactSeller}
        className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
      >
        {t('order.contactSeller')}
      </button>
    </div>
  );
};

