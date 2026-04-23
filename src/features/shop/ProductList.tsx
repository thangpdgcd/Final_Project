import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from '@/features/shop/ProductCard';
import type { Product, ViewMode } from '@/types/shop/shop.types';
import { useCurrency } from '@/components/contexts/currencycontexts/CurrencyContext';
import { translatedShopProductName } from '@/utils/products/productI18n';

type RatingProps = {
  value: number;
};

const Rating = ({ value }: RatingProps) => {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1 text-[color:var(--hl-primary-container)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? 'fill-[color:var(--hl-primary-container)]' : 'opacity-30'}
        />
      ))}
      <span className="hl-sans ml-1 text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
        {value.toFixed(1)}
      </span>
    </div>
  );
};

type ProductListProps = {
  products: readonly Product[];
  viewMode: ViewMode;
  selectedId?: Product['id'];
  onSelect?: (product: Product) => void;
};

const ProductList = ({ products, viewMode, selectedId, onSelect }: ProductListProps) => {
  const { format } = useCurrency() as any;
  const { t } = useTranslation();

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {products.map((p) => {
          const displayName = translatedShopProductName(t, p);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onSelect?.(p)}
              whileHover={{ y: -1 }}
              className={[
                'overflow-hidden rounded-md border text-left',
                'border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)] bg-[color:var(--hl-surface-lowest)]',
                'shadow-[var(--hl-ambient-shadow)] transition-shadow hover:shadow-[var(--hl-ambient-shadow-hover)]',
                selectedId === p.id
                  ? 'ring-2 ring-[color:color-mix(in_srgb,var(--hl-primary)_45%,transparent)]'
                  : '',
              ].join(' ')}
            >
              <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr]">
                <img
                  src={p.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="flex items-start justify-between gap-4 p-3 sm:p-4">
                  <div>
                    <div
                      className="text-sm font-medium text-[color:var(--hl-primary)]"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {displayName}
                    </div>
                    <div className="mt-1">
                      <Rating value={p.rating} />
                    </div>
                    {typeof p.discount === 'number' && (
                      <div className="mt-2 inline-flex items-center rounded-full bg-[color:var(--hl-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--hl-on-primary)]">
                        -{p.discount}%
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)]">
                      {format(p.priceUSD)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelect} selected={p.id === selectedId} />
      ))}
    </div>
  );
};

export default ProductList;
