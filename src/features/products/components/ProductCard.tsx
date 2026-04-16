import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { productSlugKey } from '@/utils/productSlug';
import Badge from './Badge';

interface ProductCardProps {
  product: Product;
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  onOpen: (product: Product) => void;
  onAddToCart: (product: Product, imageEl: HTMLImageElement | null) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, title, description, price, imageSrc, onOpen, onAddToCart }) => {
    const { t } = useTranslation();
    const imageRef = useRef<HTMLImageElement | null>(null);

    const badges = useMemo(() => {
      const list: Array<{ label: string; variant: 'bestSeller' | 'new' }> = [];
      if (Number(product.price) > 35000) {
        list.push({ label: t('products.badges.bestSeller'), variant: 'bestSeller' });
      }
      if (productSlugKey(product.name || '') === 'butter_croissant') {
        list.push({ label: t('products.badges.new'), variant: 'new' });
      }
      return list;
    }, [product.name, product.price, t]);

    return (
      <motion.article
        layout
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-stone-800 dark:bg-[#1e1e1e]"
        onClick={() => onOpen(product)}
      >
        <div className="relative overflow-hidden rounded-sm">
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2 rounded-full">
            {badges.map((badge) => (
              <Badge key={badge.label} label={badge.label} variant={badge.variant} />
            ))}
          </div>
          <motion.img
            ref={imageRef}
            src={imageSrc}
            alt={title}
            className="aspect-square w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/no-image.png';
            }}
          />
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <h3
            className="line-clamp-1 text-lg font-bold text-stone-900 dark:text-stone-100"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-black tracking-tight text-orange-700 dark:text-orange-400">
              {price}
            </span>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-900 transition-all hover:bg-stone-800 hover:text-white dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-200 dark:hover:text-stone-900"
            aria-label={t('products.addToCartAria')}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, imageRef.current);
            }}
          >
            <ShoppingBag size={18} className="mb-0.5" />
            <span>{t('products.addToCart')}</span>
          </motion.button>
        </div>
      </motion.article>
    );
  },
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;

