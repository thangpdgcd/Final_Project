import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Alert } from 'antd';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, XCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/store/AuthContext';
import Chatbox from '@/components/chatbox';
import ProductGrid from '@/components/products/ProductGrid';
import type { SortKey, CategoryFilter } from '@/types';
import { useTranslation } from 'react-i18next';
import { getImageSrc } from '@/utils/image';



const formatPrice = (value: number, locale = 'vi-VN'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

const PREFERRED_ORDER = ['Robusta', 'Arabica', 'Blend', 'Specialty'];
const PAGE_SIZE = 6;

const ProductsPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const categoryTabs = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const ai = PREFERRED_ORDER.findIndex(x => x.toLowerCase() === a.name.toLowerCase());
      const bi = PREFERRED_ORDER.findIndex(x => x.toLowerCase() === b.name.toLowerCase());
      const aR = ai === -1 ? 999 : ai;
      const bR = bi === -1 ? 999 : bi;
      if (aR !== bR) return aR - bR;
      return a.name.localeCompare(b.name);
    });
    return [
      { key: 'all' as const, label: t('products.tabs.all') },
      ...sorted.map((c) => ({
        key: c.category_ID,
        label: t(`categories.byId.${c.category_ID}.name`, {
          defaultValue: c.name || `#${c.category_ID}`,
        }),
      })),
    ];
  }, [categories, t]);

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list = activeCategoryId === 'all'
      ? [...products]
      : products.filter(p => Number(p.categories_ID) === activeCategoryId);

    if (q) {
      list = list.filter((p) => {
        const productName = t(`products.byId.${p.product_ID}.name`, { defaultValue: p.name || '' });
        const productDesc = t(`products.byId.${p.product_ID}.description`, { defaultValue: p.description || '' });
        return `${productName} ${productDesc}`.toLowerCase().includes(q);
      });
    }

    switch (sortKey) {
      case 'price_asc': list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'name_asc':
        list.sort((a, b) => {
          const aName = t(`products.byId.${a.product_ID}.name`, { defaultValue: a.name || '' });
          const bName = t(`products.byId.${b.product_ID}.name`, { defaultValue: b.name || '' });
          return aName.localeCompare(bName, i18n.language);
        });
        break;
      case 'name_desc':
        list.sort((a, b) => {
          const aName = t(`products.byId.${a.product_ID}.name`, { defaultValue: a.name || '' });
          const bName = t(`products.byId.${b.product_ID}.name`, { defaultValue: b.name || '' });
          return bName.localeCompare(aName, i18n.language);
        });
        break;
    }
    return list;
  }, [products, activeCategoryId, debouncedQuery, sortKey, t, i18n.language]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const handleFilterChange = useCallback((newCat: CategoryFilter) => {
    setActiveCategoryId(newCat);
    setPage(1);
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: SortKey) => {
    setSortKey(value);
    setPage(1);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE)),
    [filteredProducts.length],
  );

  useEffect(() => {
    setPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  const displayItems = useMemo(
    () =>
      paginatedProducts.map((p) => ({
        product: p,
        title: t(`products.byId.${p.product_ID}.name`, { defaultValue: p.name || '' }),
        description: t(`products.byId.${p.product_ID}.description`, {
          defaultValue: p.description || t('products.defaultDescription'),
        }),
        priceText: formatPrice(Number(p.price), i18n.language === 'vi' ? 'vi-VN' : 'en-US'),
        imageSrc: getImageSrc(p.image),
      })),
    [paginatedProducts, t, i18n.language],
  );

  const animateFlyToCart = useCallback((imageEl: HTMLImageElement | null) => {
    if (!imageEl) return;
    const cartTarget = document.querySelector<HTMLElement>('[data-cart-target="header"]');
    if (!cartTarget) return;

    const startRect = imageEl.getBoundingClientRect();
    const endRect = cartTarget.getBoundingClientRect();

    const clone = imageEl.cloneNode(true) as HTMLImageElement;
    clone.style.position = 'fixed';
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    clone.style.objectFit = 'cover';
    clone.style.borderRadius = '16px';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';

    document.body.appendChild(clone);

    const deltaX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    const deltaY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
    clone.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 0.95 },
        { transform: `translate(${deltaX * 0.65}px, ${deltaY * 0.65}px) scale(0.55)`, opacity: 0.85, offset: 0.7 },
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.18)`, opacity: 0 },
      ],
      { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).onfinish = () => {
      clone.remove();
    };
  }, []);

  const handleAddToCart = useCallback(
    (productId: number, price: number, imageEl: HTMLImageElement | null) => {
      const userId = Number(user?.user_ID);
      if (!Number.isFinite(userId) || userId <= 0) {
        navigate('/login', { state: { from: { pathname: '/products' } } });
        return;
      }

      animateFlyToCart(imageEl);

      addToCart.mutate(
        { user_ID: userId, product_ID: productId, quantity: 1, price },
        {
          onSuccess: () => {
            window.dispatchEvent(new CustomEvent('cart:item-added'));
            message.success(t('products.addToCartSuccess', { defaultValue: '☕ Added to your brew' }));
          },
          onError: () => {
            message.error(t('products.addToCartError', { defaultValue: 'Unable to add to cart' }));
          },
        },
      );
    },
    [addToCart, animateFlyToCart, message, navigate, t, user?.user_ID],
  );

  const handleClearFilters = useCallback(() => {
    setActiveCategoryId('all');
    setQuery('');
    setDebouncedQuery('');
    setSortKey('default');
    setPage(1);
  }, []);

  if (productsError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Alert type="error" showIcon message={t('products.loadError')} description={(productsError as Error).message} />
      </div>
    );
  }

  return (
    <motion.div
      className="product-page scroll-smooth bg-[#faf7f2] text-stone-800 transition-colors duration-300 dark:bg-[#121212] dark:text-stone-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Hero Banner */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: 320,
          background: 'linear-gradient(135deg, #4e3524 0%, #6f4e37 50%, #c4963b 100%)',
        }}
      >
        <div className="text-center z-10 animate-fade-in-up">
          <p className="text-amber-300 text-sm font-semibold tracking-widest uppercase mb-2">
            {t('products.heroKicker')}
          </p>
          <h1 className="text-white text-4xl md:text-5xl mb-0" style={{ fontFamily: 'var(--font-display)' }}>
            {t('products.heroTitle')}
          </h1>
          <p className="text-amber-100 mt-3 text-base max-w-md mx-auto">
            {t('products.heroSubtitle')}
          </p>
        </div>
        {/* decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full opacity-10" style={{ background: '#fff' }} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <label className="group relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-600"
            />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-stone-700 dark:bg-[#1e1e1e] dark:text-stone-200 dark:focus:border-orange-500 dark:focus:ring-orange-900/40"
            />
          </label>

          <div className="relative md:w-60">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={sortKey}
              onChange={(e) => handleSortChange(e.target.value as SortKey)}
              className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-all duration-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-stone-700 dark:bg-[#1e1e1e] dark:text-stone-200 dark:focus:border-orange-500 dark:focus:ring-orange-900/40"
            >
              <option value="default">{t('products.sort.default')}</option>
              <option value="price_asc">{t('products.sort.priceAsc')}</option>
              <option value="price_desc">{t('products.sort.priceDesc')}</option>
              <option value="name_asc">{t('products.sort.nameAsc')}</option>
              <option value="name_desc">{t('products.sort.nameDesc')}</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist">
          {categoryTabs.map(tab => (
            <button
              key={String(tab.key)}
              role="tab"
              aria-selected={activeCategoryId === tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeCategoryId === tab.key
                  ? 'bg-[#6f4e37] text-white shadow-md dark:bg-orange-700'
                  : 'border border-stone-300 bg-white text-stone-700 hover:border-orange-400 dark:border-stone-700 dark:bg-[#1e1e1e] dark:text-stone-300 dark:hover:border-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
          {filteredProducts.length.toLocaleString()} {t('products.itemsLabel')}
        </p>

        <ProductGrid
          loading={productsLoading}
          items={displayItems}
          emptyLabel={t('products.empty')}
          listKey={`${activeCategoryId}-${debouncedQuery}-${sortKey}-${page}`}
          onOpen={(product) => navigate(`/products/${product.product_ID}`)}
          onAddToCart={(product, imageEl) => handleAddToCart(product.product_ID, Number(product.price), imageEl)}
        />

        {!productsLoading && displayItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center dark:border-stone-700 dark:bg-[#1a1a1a]">
            <XCircle className="mx-auto mb-3 text-stone-400 dark:text-stone-500" size={28} />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t('products.empty')} {t('products.searchPlaceholder')}
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-200 dark:bg-orange-900/60 dark:text-orange-200 dark:hover:bg-orange-900"
            >
              {t('common.clear', { defaultValue: 'Clear Filters' })}
            </button>
          </div>
        )}

        {!productsLoading && filteredProducts.length > PAGE_SIZE && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-300"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const value = index + 1;
              const active = value === page;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  className={`h-9 w-9 rounded-lg text-sm transition ${
                    active
                      ? 'bg-orange-600 text-white'
                      : 'border border-stone-300 text-stone-600 hover:border-orange-400 dark:border-stone-700 dark:text-stone-300 dark:hover:border-orange-500'
                  }`}
                >
                  {value}
                </button>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="pointer-events-none fixed bottom-6 right-6 hidden items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs text-white shadow-lg md:flex dark:bg-white/10 dark:text-stone-200"
      >
        <Sparkles size={14} />
        Premium coffee experience
      </motion.div>
      <Chatbox />
    </motion.div>
  );
};

export default ProductsPage;
