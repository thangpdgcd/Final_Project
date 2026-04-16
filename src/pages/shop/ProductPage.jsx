import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import SortBar from '@/components/shop/SortBar';
import ProductList from '@/components/shop/ProductList';
import CurrencySwitcher from '@/components/shop/CurrencySwitcher';
import ShippingMethod from '@/components/shop/checkout/ShippingMethod';
import TotalCostCard from '@/components/shop/checkout/TotalCostCard';
import PriceRangeFilter from '@/components/shop/filters/PriceRangeFilter';
import AccordionFilters from '@/components/shop/filters/AccordionFilters';
import { products as productData } from '@/data/products';

const getDefaultPriceBounds = (items) => {
  const prices = items.map((p) => p.priceUSD);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
};

const sortProducts = (items, sortBy) => {
  const arr = [...items];
  switch (sortBy) {
    case 'price-asc':
      arr.sort((a, b) => a.priceUSD - b.priceUSD);
      break;
    case 'price-desc':
      arr.sort((a, b) => b.priceUSD - a.priceUSD);
      break;
    case 'rating-desc':
      arr.sort((a, b) => b.rating - a.rating);
      break;
    case 'name-asc':
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return arr;
};

const panelClass =
  'rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)] bg-[color:var(--hl-surface-lowest)] p-4 shadow-[var(--hl-ambient-shadow)]';

const ProductPage = () => {
  useDocumentTitle('pages.shop.documentTitle');

  const bounds = useMemo(() => getDefaultPriceBounds(productData), []);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([bounds.min, bounds.max]);
  const [selectedProductId, setSelectedProductId] = useState(productData[0]?.id);

  const filtered = useMemo(() => {
    const base = productData.filter((p) => p.priceUSD >= priceRange[0] && p.priceUSD <= priceRange[1]);
    return sortProducts(base, sortBy);
  }, [priceRange, sortBy]);

  const selectedProduct = useMemo(
    () => productData.find((p) => p.id === selectedProductId) ?? filtered[0],
    [selectedProductId, filtered],
  );

  const subtotalUSD = selectedProduct?.priceUSD ?? 0;

  return (
    <div className="pb-16 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="hl-sans text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] sm:text-sm">Coffee shop</p>
          <h1
            className="mt-4 text-4xl font-medium leading-[1.12] tracking-tight text-[color:var(--hl-primary)] sm:text-5xl lg:text-[3rem]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            Shop premium coffee
          </h1>
          <p className="hl-sans mt-4 text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_76%,transparent)]">
            Dark roast to light bloom—filter by price, switch currency instantly, and preview total cost with shipping.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className={panelClass}>
              <CurrencySwitcher />
            </div>

            <div className={panelClass}>
              <PriceRangeFilter min={bounds.min} max={bounds.max} priceRange={priceRange} setPriceRange={setPriceRange} />
            </div>

            <div className={panelClass}>
              <AccordionFilters />
            </div>

            <div className={panelClass}>
              <ShippingMethod />
            </div>

            <TotalCostCard productSubtotalUSD={subtotalUSD} />
          </aside>

          <section className="space-y-4">
            <div className={panelClass}>
              <SortBar sortBy={sortBy} onChangeSort={setSortBy} resultsCount={filtered.length} viewMode={viewMode} onChangeViewMode={setViewMode} />
            </div>

            <ProductList
              products={filtered}
              viewMode={viewMode}
              selectedId={selectedProduct?.id}
              onSelect={(p) => setSelectedProductId(p.id)}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
