import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Alert } from 'antd';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, RotateCcw, Search, SlidersHorizontal, XCircle } from 'lucide-react';
import { useProducts } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/categories/useCategories';
import { useAddToCart } from '@/hooks/cart/useCart';
import Chatbox from '@/types/widgets/chatbox';
import ProductGrid from '@/features/products/ProductGrid';
import type { SortKey, CategoryFilter } from '@/types/index';
import { useTranslation } from 'react-i18next';
import { getImageSrc } from '@/utils/images/image';
import { productSlugKey } from '@/utils/products/productSlug';
import { translatedProductDescription, translatedProductName } from '@/utils/products/productI18n';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import { useEffectiveUserId } from '@/hooks/usereffectiveuserids/useEffectiveUserId';

const formatPrice = (value: number, locale = 'vi-VN'): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

const PREFERRED_ORDER = ['Robusta', 'Arabica', 'Blend', 'Specialty'];
const PAGE_SIZE = 6;
const CATEGORY_LABEL_OVERRIDES: Record<string, { vi: string; en?: string }> = {
  Accessories: { vi: 'Dụng cụ pha chế' },
  Stationery: { vi: 'Sản phẩm riêng' },
};

const BREWING_TOOLS_GROUP_NAMES = ['Accessories'] as const;
const HIDDEN_CATEGORY_TABS = new Set(
  ['Tea', 'Electronics', 'Office Tools', 'Bakery'].map((s) => s.toLowerCase()),
);
const PRIVATE_PRODUCTS_GROUP_NAMES = ['Stationery', 'Electronics', 'Office Tools'] as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const BREWING_TOOLS_PRODUCT_SLUGS = new Set<string>([
  'gel_pen_set_10_pack',
  'laptop_stand',
  'laptop_stand_aluminum',
  'desk_organizer_tray',
]);

const ProductsPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const effectiveUserId = useEffectiveUserId();
  const addToCart = useAddToCart();
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [page, setPage] = useState(1);
  const [openFilters, setOpenFilters] = useState({
    price: true,
    availability: true,
  });
  const [availability, setAvailability] = useState({
    inStock: false,
    outOfStock: false,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [] } = useCategories();

  useDocumentTitle('pages.products.documentTitle');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const categoryTabs = useMemo(() => {
    const visibleCategories = categories.filter((c) => {
      const name = String(c?.name ?? '')
        .trim()
        .toLowerCase();
      if (!name) return true;
      return !HIDDEN_CATEGORY_TABS.has(name);
    });

    const sorted = [...visibleCategories].sort((a, b) => {
      const ai = PREFERRED_ORDER.findIndex((x) => x.toLowerCase() === a.name.toLowerCase());
      const bi = PREFERRED_ORDER.findIndex((x) => x.toLowerCase() === b.name.toLowerCase());
      const aR = ai === -1 ? 999 : ai;
      const bR = bi === -1 ? 999 : bi;
      if (aR !== bR) return aR - bR;
      return a.name.localeCompare(b.name);
    });

    const getCategoryLabel = (c: (typeof categories)[number]) => {
      const byId = t(`categories.byId.${c.category_ID}.name`, {
        defaultValue: c.name || `#${c.category_ID}`,
      });

      const rawName = String(c.name ?? '');
      const override = CATEGORY_LABEL_OVERRIDES[rawName];
      if (!override) return byId;
      if (i18n.language === 'vi') return override.vi;
      if (override.en) return override.en;
      return byId;
    };

    return [
      { key: 'all' as const, label: t('products.tabs.all') },
      ...sorted.map((c) => ({
        key: c.category_ID,
        label: getCategoryLabel(c),
      })),
    ];
  }, [categories, t, i18n.language]);

  const brewingToolsCategoryIds = useMemo(() => {
    const normalizedToId = new Map<string, number>();
    for (const c of categories) {
      const name = String(c?.name ?? '')
        .trim()
        .toLowerCase();
      const id = Number((c as any)?.category_ID);
      if (name && Number.isFinite(id)) normalizedToId.set(name, id);
    }
    return BREWING_TOOLS_GROUP_NAMES.map((n) => normalizedToId.get(n.toLowerCase())).filter(
      (id): id is number => typeof id === 'number' && Number.isFinite(id),
    );
  }, [categories]);

  const privateProductsCategoryIds = useMemo(() => {
    const normalizedToId = new Map<string, number>();
    for (const c of categories) {
      const name = String(c?.name ?? '')
        .trim()
        .toLowerCase();
      const id = Number((c as any)?.category_ID);
      if (name && Number.isFinite(id)) normalizedToId.set(name, id);
    }
    return PRIVATE_PRODUCTS_GROUP_NAMES.map((n) => normalizedToId.get(n.toLowerCase())).filter(
      (id): id is number => typeof id === 'number' && Number.isFinite(id),
    );
  }, [categories]);

  const priceBounds = useMemo(() => {
    const prices = products
      .map((p) => Number((p as any)?.price ?? 0))
      .filter((n) => Number.isFinite(n) && n >= 0);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return { min, max };
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setPriceRange((prev) => {
      const [a, b] = prev;
      const isUnset = !Number.isFinite(a) || !Number.isFinite(b) || (a === 0 && b === 0);
      if (!isUnset) return prev;
      return [priceBounds.min, priceBounds.max];
    });
  }, [priceBounds.min, priceBounds.max]);

  const activeFilterCount = useMemo(() => {
    const [minP, maxP] = priceRange;
    const priceActive =
      Number.isFinite(minP) &&
      Number.isFinite(maxP) &&
      (minP > priceBounds.min || maxP < priceBounds.max);
    return (
      (priceActive ? 1 : 0) + (availability.inStock ? 1 : 0) + (availability.outOfStock ? 1 : 0)
    );
  }, [availability.inStock, availability.outOfStock, priceRange, priceBounds.min, priceBounds.max]);

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list =
      activeCategoryId === 'all'
        ? [...products]
        : (() => {
            const accessoriesId = brewingToolsCategoryIds[0];
            if (
              accessoriesId &&
              activeCategoryId === accessoriesId &&
              brewingToolsCategoryIds.length > 0
            ) {
              const allowed = new Set<number>(brewingToolsCategoryIds);
              return products.filter((p) => {
                if (allowed.has(Number(p.categories_ID))) return true;
                return BREWING_TOOLS_PRODUCT_SLUGS.has(productSlugKey((p as any)?.name));
              });
            }

            const stationeryId = privateProductsCategoryIds[0];
            if (
              stationeryId &&
              activeCategoryId === stationeryId &&
              privateProductsCategoryIds.length > 0
            ) {
              const allowed = new Set<number>(privateProductsCategoryIds);
              return products.filter((p) => {
                if (!allowed.has(Number(p.categories_ID))) return false;
                return !BREWING_TOOLS_PRODUCT_SLUGS.has(productSlugKey((p as any)?.name));
              });
            }

            return products.filter((p) => Number(p.categories_ID) === activeCategoryId);
          })();

    if (availability.inStock || availability.outOfStock) {
      list = list.filter((p) => {
        const stock = Number((p as any)?.stock ?? 0);
        const isIn = Number.isFinite(stock) ? stock > 0 : true;
        if (availability.inStock && isIn) return true;
        if (availability.outOfStock && !isIn) return true;
        return false;
      });
    }

    const [minP, maxP] = priceRange;
    if (
      Number.isFinite(minP) &&
      Number.isFinite(maxP) &&
      (minP !== priceBounds.min || maxP !== priceBounds.max)
    ) {
      list = list.filter((p) => {
        const price = Number((p as any)?.price ?? 0);
        return Number.isFinite(price) && price >= minP && price <= maxP;
      });
    }

    if (q) {
      list = list.filter((p) => {
        const productName = translatedProductName(t, p);
        const productDesc = translatedProductDescription(t, p, 'list');
        return `${productName} ${productDesc}`.toLowerCase().includes(q);
      });
    }

    switch (sortKey) {
      case 'price_asc':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name_asc':
        list.sort((a, b) => {
          const aName = translatedProductName(t, a);
          const bName = translatedProductName(t, b);
          return aName.localeCompare(bName, i18n.language);
        });
        break;
      case 'name_desc':
        list.sort((a, b) => {
          const aName = translatedProductName(t, a);
          const bName = translatedProductName(t, b);
          return bName.localeCompare(aName, i18n.language);
        });
        break;
    }
    return list;
  }, [
    products,
    activeCategoryId,
    debouncedQuery,
    sortKey,
    t,
    i18n.language,
    brewingToolsCategoryIds,
    privateProductsCategoryIds,
    availability.inStock,
    availability.outOfStock,
    priceRange,
    priceBounds.min,
    priceBounds.max,
  ]);

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
        title: translatedProductName(t, p),
        description: translatedProductDescription(t, p, 'list'),
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
        {
          transform: `translate(${deltaX * 0.65}px, ${deltaY * 0.65}px) scale(0.55)`,
          opacity: 0.85,
          offset: 0.7,
        },
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.18)`, opacity: 0 },
      ],
      { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).onfinish = () => {
      clone.remove();
    };
  }, []);

  const handleAddToCart = useCallback(
    (productId: number, price: number, imageEl: HTMLImageElement | null) => {
      const userId = Number(effectiveUserId);
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
            message.success(t('products.addToCartSuccess'));
          },
          onError: () => {
            message.error(t('products.addToCartError'));
          },
        },
      );
    },
    [addToCart, animateFlyToCart, effectiveUserId, message, navigate, t],
  );

  const handleClearFilters = useCallback(() => {
    setActiveCategoryId('all');
    setQuery('');
    setDebouncedQuery('');
    setSortKey('default');
    setPage(1);
    setAvailability({ inStock: false, outOfStock: false });
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  if (productsError) {
    return (
      <div className="about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
        <div className="relative z-[1] mx-auto max-w-3xl px-5 py-12">
          <Alert
            type="error"
            showIcon
            message={t('products.loadError')}
            description={(productsError as Error).message}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="about-page about-page--bg-animate product-page scroll-smooth min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)] transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="relative z-[1]">
        <section
          className="mx-auto max-w-[1400px] px-5 pb-10 pt-8 sm:px-8 lg:px-12 lg:pb-14 lg:pt-10"
          aria-labelledby="products-hero-heading"
        >
          <p className="hl-sans text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] sm:text-sm">
            {t('products.heroKicker')}
          </p>
          <h1
            id="products-hero-heading"
            className="mt-4 text-4xl font-medium leading-[1.12] tracking-tight text-[color:var(--hl-primary)] sm:text-5xl lg:text-[3rem]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {t('products.heroTitle')}
          </h1>
          <p className="hl-sans mt-4 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)]">
            {t('products.heroSubtitle')}
          </p>
        </section>

        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">
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
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="h-fit space-y-4  lg:top-24">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-[#1e1e1e]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100">
                    <Filter size={16} className="text-[#6f4e37] dark:text-orange-300" />
                    {t('products.filters.title')}
                    {activeFilterCount > 0 ? (
                      <span className="ml-1 inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-white/10 dark:text-stone-200">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={
                      activeFilterCount === 0 &&
                      activeCategoryId === 'all' &&
                      !debouncedQuery &&
                      sortKey === 'default'
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
                  >
                    <RotateCcw size={14} />
                    {t('products.filters.reset')}
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setOpenFilters((s) => ({ ...s, price: !s.price }))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                      {t('products.filters.price')}
                    </span>
                    <ChevronDown
                      size={18}
                      className={[
                        'text-stone-500 transition-transform dark:text-stone-300',
                        openFilters.price ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  </button>
                  {openFilters.price ? (
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
                        <span>
                          {formatPrice(priceRange[0], i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                        </span>
                        <span>
                          {formatPrice(priceRange[1], i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                        </span>
                      </div>
                      <div className="mt-3 space-y-3">
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange(([_, maxV]) => [
                              clamp(Number(e.target.value), priceBounds.min, maxV),
                              maxV,
                            ])
                          }
                          className="w-full accent-[#6f4e37] dark:accent-orange-400"
                          aria-label="Minimum price"
                        />
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange(([minV, _]) => [
                              minV,
                              clamp(Number(e.target.value), minV, priceBounds.max),
                            ])
                          }
                          className="w-full accent-[#6f4e37] dark:accent-orange-400"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setOpenFilters((s) => ({ ...s, availability: !s.availability }))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                      {t('products.filters.availability')}
                    </span>
                    <ChevronDown
                      size={18}
                      className={[
                        'text-stone-500 transition-transform dark:text-stone-300',
                        openFilters.availability ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  </button>
                  {openFilters.availability ? (
                    <div className="px-4 pb-4">
                      <label className="flex cursor-pointer items-center justify-between gap-3 py-2 text-sm text-stone-700 dark:text-stone-200">
                        <span>{t('products.filters.inStock')}</span>
                        <input
                          type="checkbox"
                          checked={availability.inStock}
                          onChange={(e) =>
                            setAvailability((s) => ({ ...s, inStock: e.target.checked }))
                          }
                          className="h-4 w-4 accent-[#6f4e37] dark:accent-orange-400"
                        />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between gap-3 py-2 text-sm text-stone-700 dark:text-stone-200">
                        <span>{t('products.filters.outOfStock')}</span>
                        <input
                          type="checkbox"
                          checked={availability.outOfStock}
                          onChange={(e) =>
                            setAvailability((s) => ({ ...s, outOfStock: e.target.checked }))
                          }
                          className="h-4 w-4 accent-[#6f4e37] dark:accent-orange-400"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>

            <section>
              <div className="mb-6 flex flex-wrap gap-2" role="tablist">
                {categoryTabs.map((tab) => (
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
                onAddToCart={(product, imageEl) =>
                  handleAddToCart(product.product_ID, Number(product.price), imageEl)
                }
              />
            </section>
          </div>

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
                {t('products.filters.reset')}
              </button>
            </div>
          )}

          {!productsLoading && filteredProducts.length > PAGE_SIZE && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-300"
              >
                {t('products.pagination.prev')}
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const value = index + 1;
                const active = value === page;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`h-9 w-9 rounded-lg text-sm transition cursor-pointer ${
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
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-300"
              >
                {t('products.pagination.next')}
              </button>
            </div>
          )}
          <Chatbox />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductsPage;
