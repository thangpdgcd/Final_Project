import type { TFunction } from 'i18next';
import type { Product } from '@/types/index';
import i18n from '@/translates/i18n';
import { productNameSlugCandidates } from './productSlug';

type ProductNameFields = Pick<Product, 'product_ID' | 'name'> & {
  name_en?: string;
  name_vi?: string;
};

type ProductDescFields = Pick<Product, 'product_ID' | 'name' | 'description'> & {
  name_en?: string;
  name_vi?: string;
  description_en?: string;
  description_vi?: string;
};

const langIsVi = () =>
  String(i18n.language || '')
    .toLowerCase()
    .startsWith('vi');

const pickLocalizedName = (product: ProductNameFields): string => {
  if (langIsVi() && product.name_vi?.trim()) return product.name_vi.trim();
  if (!langIsVi() && product.name_en?.trim()) return product.name_en.trim();
  return String(product.name ?? '');
};

const pickLocalizedDescription = (product: ProductDescFields): string => {
  if (langIsVi() && product.description_vi?.trim()) return product.description_vi.trim();
  if (!langIsVi() && product.description_en?.trim()) return product.description_en.trim();
  return String(product.description ?? '');
};

const chainByName = (
  t: TFunction,
  field: 'name' | 'description',
  nameForSlug: string,
  fallback: string,
): string => {
  let current = fallback;
  for (const slug of productNameSlugCandidates(nameForSlug)) {
    current = t(`products.byName.${slug}.${field}`, { defaultValue: current });
  }
  return current;
};

/** Prefer `products.byId.<id>.*` when id > 0, then `products.byName.*` (slug candidates), then API / locale text. */
export const translatedProductName = (t: TFunction, product: ProductNameFields): string => {
  const resolvedName = pickLocalizedName(product);
  const fromByName = chainByName(t, 'name', resolvedName, resolvedName);
  const pid = Number(product.product_ID);
  if (Number.isFinite(pid) && pid > 0) {
    return t(`products.byId.${pid}.name`, { defaultValue: fromByName });
  }
  return fromByName;
};

export const translatedProductDescription = (
  t: TFunction,
  product: ProductDescFields,
  mode: 'list' | 'detail',
): string => {
  const resolvedName = pickLocalizedName(product);
  const rawDesc = pickLocalizedDescription(product);
  const innerDefault = mode === 'list' ? rawDesc || t('products.defaultDescription') : rawDesc;

  const fromByName = chainByName(t, 'description', resolvedName, innerDefault);
  const pid = Number(product.product_ID);
  if (Number.isFinite(pid) && pid > 0) {
    return t(`products.byId.${pid}.description`, { defaultValue: fromByName });
  }
  return fromByName;
};

/** Legacy `/shop` catalog items: string ids use byName only (`product_ID` 0). */
export const translatedShopProductName = (
  t: TFunction,
  product: { id: string | number; name: string; name_en?: string; name_vi?: string },
): string => {
  const pid =
    typeof product.id === 'number' && Number.isFinite(product.id) && product.id > 0
      ? product.id
      : 0;
  return translatedProductName(t, {
    product_ID: pid,
    name: product.name,
    name_en: product.name_en,
    name_vi: product.name_vi,
  });
};
