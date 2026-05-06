import type { CartItem as CartItemType } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { getImageSrc } from '@/utils/images/image';
import { translatedProductName } from '@/utils/products/productI18n';
import { useAppTranslation } from '@/hooks/userapptranslations/useAppTranslation';

export const CartItemProductInfo = ({ item }: { item: CartItemType }) => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const displayName = translatedProductName(t, {
    product_ID: item.product_ID,
    name: item.products?.name ?? '',
  });
  const productId = Number(item.product_ID ?? (item.products as any)?.product_ID);
  const canNavigate = Number.isFinite(productId) && productId > 0;
  return (
    <div
      className={[
        'flex min-w-0 flex-1 gap-4',
        canNavigate ? 'cursor-pointer' : '',
      ].join(' ')}
      role={canNavigate ? 'link' : undefined}
      tabIndex={canNavigate ? 0 : -1}
      onClick={() => {
        if (!canNavigate) return;
        navigate(`/products/${productId}`);
      }}
      onKeyDown={(e) => {
        if (!canNavigate) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        navigate(`/products/${productId}`);
      }}
      aria-label={canNavigate ? displayName : undefined}
    >
      <img
        src={getImageSrc(item.products?.image)}
        alt={displayName}
        className="h-20 w-20 rounded-lg border border-stone-100 bg-stone-50 object-cover dark:border-stone-800 dark:bg-stone-800"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/no-image.png';
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col pr-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-stone-900 dark:text-stone-100">
          {displayName}
        </h3>
        <div className="mt-2 inline-flex w-fit items-center rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-[10px] text-orange-600 sm:text-xs dark:border-orange-800 dark:bg-orange-900/20">
          {t('customersCart.badges.freeReturns15')}
        </div>
      </div>
    </div>
  );
};

