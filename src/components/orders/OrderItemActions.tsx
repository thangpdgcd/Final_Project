import React from 'react';

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
  onViewProduct: (productId: number) => void;
  onContactSeller: () => void;
};

export const OrderItemActions: React.FC<Props> = ({
  canAct,
  busy,
  args,
  onBuyAgainItem,
  onViewProduct,
  onContactSeller,
}) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!canAct || busy}
        onClick={() => onBuyAgainItem(args)}
        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        Buy again
      </button>
      <button
        type="button"
        onClick={() => onViewProduct(args.productId)}
        className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
      >
        View
      </button>
      <button
        type="button"
        onClick={onContactSeller}
        className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
      >
        Contact
      </button>
    </div>
  );
};

