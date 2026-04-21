import React from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import type { Product } from '@/types/index';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface ProductGridItem {
  product: Product;
  title: string;
  description: string;
  imageSrc: string;
  priceText: string;
}

interface ProductGridProps {
  items: ProductGridItem[];
  loading: boolean;
  emptyLabel: string;
  listKey: string;
  onOpen: (product: Product) => void;
  onAddToCart: (product: Product, imageEl: HTMLImageElement | null) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const ProductGrid: React.FC<ProductGridProps> = React.memo(
  ({ items, loading, emptyLabel, listKey, onOpen, onAddToCart }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={listKey}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div key={item.product.product_ID} variants={itemVariants} layout>
                <ProductCard
                  product={item.product}
                  title={item.title}
                  description={item.description}
                  imageSrc={item.imageSrc}
                  price={item.priceText}
                  onOpen={onOpen}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="col-span-full">
              <p className="rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center text-stone-500 dark:border-stone-700 dark:text-stone-400">
                {emptyLabel}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  },
);

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;

