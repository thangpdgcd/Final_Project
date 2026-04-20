import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Product } from '@/components/shop/shop.types';
import { translatedShopProductName } from '@/utils/productI18n';

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

type ProductCardProps = {
  product: Product;
  selected?: boolean;
  onSelect?: (product: Product) => void;
};

const ProductCard = ({ product, onSelect, selected }: ProductCardProps) => {
  const { format } = useCurrency() as any;
  const { t } = useTranslation();
  const displayName = translatedShopProductName(t, product);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(product)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={[
        'group overflow-hidden rounded-md border text-left',
        'border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)] bg-[color:var(--hl-surface-lowest)]',
        'shadow-[var(--hl-ambient-shadow)] transition-shadow hover:shadow-[var(--hl-ambient-shadow-hover)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hl-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hl-surface)]',
        selected ? 'ring-2 ring-[color:color-mix(in_srgb,var(--hl-primary)_45%,transparent)]' : '',
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={displayName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {typeof product.discount === 'number' && (
          <div className="absolute left-3 top-3 rounded-full bg-[color:var(--hl-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--hl-on-primary)]">
            -{product.discount}%
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--hl-primary)_22%,transparent)] via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="line-clamp-1 text-sm font-medium text-[color:var(--hl-primary)]"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {displayName}
            </div>
            <div className="mt-1">
              <Rating value={product.rating} />
            </div>
          </div>
          <div className="text-right">
            <div className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)]">
              {format(product.priceUSD)}
            </div>
            {typeof product.discount === 'number' && (
              <div className="hl-sans text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_50%,transparent)]">
                <span className="line-through">
                  {format(product.priceUSD / (1 - product.discount / 100))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default ProductCard;
