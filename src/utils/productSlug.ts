/** Normalizes API product names to stable i18n keys (see products.byName.*). */
export const productSlugKey = (value: string): string => {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
};
