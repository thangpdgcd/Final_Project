import type { TFunction } from 'i18next';
import type { Product } from '@/types';
import { productSlugKey } from './productSlug';

/** Prefer `products.byId.<id>.*` (stable), then `products.byName.<slug>.*`, then API text. */
export const translatedProductName = (
  t: TFunction,
  product: Pick<Product, 'product_ID' | 'name'>,
): string => {
  return t(`products.byId.${product.product_ID}.name`, {
    defaultValue: t(`products.byName.${productSlugKey(product.name || '')}.name`, {
      defaultValue: product.name || '',
    }),
  });
};

export const translatedProductDescription = (
  t: TFunction,
  product: Pick<Product, 'product_ID' | 'name' | 'description'>,
  mode: 'list' | 'detail',
): string => {
  const slug = productSlugKey(product.name || '');
  const raw = product.description || '';
  const innerDefault = mode === 'list' ? raw || t('products.defaultDescription') : raw;

  return t(`products.byId.${product.product_ID}.description`, {
    defaultValue: t(`products.byName.${slug}.description`, {
      defaultValue: innerDefault,
    }),
  });
};
