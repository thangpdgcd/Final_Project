/** Normalizes API product names to stable i18n keys (see products.byName.*). */
export const productSlugKey = (value: string): string => {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
};

const TRAILING_SLUG_SUFFIXES = new Set([
  'nguyen_chat',
  'nguyenchat',
  'dac_biet',
  'dacbiet',
  'tui_250g',
  'tui250g',
  'loai_1',
  'loai1',
]);

/**
 * Ordered slug candidates (most specific first): full slug, then without trailing marketing tokens,
 * then one shorter parent path for long keys — improves `products.byName.*` hits for Vietnamese names.
 */
export const productNameSlugCandidates = (name: string): string[] => {
  const full = productSlugKey(name);
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (s: string) => {
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  add(full);
  let parts = full.split('_').filter(Boolean);
  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (TRAILING_SLUG_SUFFIXES.has(last)) {
      parts = parts.slice(0, -1);
      add(parts.join('_'));
    } else {
      break;
    }
  }
  if (parts.length > 4) {
    add(parts.slice(0, -1).join('_'));
  }
  return out;
};
