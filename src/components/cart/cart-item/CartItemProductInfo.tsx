import type { CartItem as CartItemType } from '@/types';
import { getImageSrc } from '@/utils/image';

export function CartItemProductInfo({ item }: { item: CartItemType }) {
  return (
    <div className="flex flex-1 gap-4 min-w-0">
      <img
        src={getImageSrc(item.products?.image)}
        alt={item.products?.name || ''}
        className="h-20 w-20 rounded-lg object-cover bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-800"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/no-image.png';
        }}
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
  );
}

