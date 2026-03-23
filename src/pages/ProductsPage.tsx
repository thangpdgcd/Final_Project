import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Skeleton, Alert, Pagination, Select, Input } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import Chatbox from '@/components/chatbox';
import type { SortKey, CategoryFilter } from '@/types';

const { Search } = Input;

const getImageSrc = (img?: string | null): string => {
  if (!img) return '/no-image.png';
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('data:image/')) return v;
  const head = v.slice(0, 12);
  const mime =
    head.startsWith('/9j/') ? 'image/jpeg' :
    head.startsWith('iVBOR') ? 'image/png' :
    'image/webp';
  return `data:${mime};base64,${v}`;
};

const formatPrice = (value: number, locale = 'vi-VN'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

const PREFERRED_ORDER = ['Robusta', 'Arabica', 'Blend', 'Specialty'];
const PAGE_SIZE = 6;

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [] } = useCategories();

  const categoryTabs = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const ai = PREFERRED_ORDER.findIndex(x => x.toLowerCase() === a.name.toLowerCase());
      const bi = PREFERRED_ORDER.findIndex(x => x.toLowerCase() === b.name.toLowerCase());
      const aR = ai === -1 ? 999 : ai;
      const bR = bi === -1 ? 999 : bi;
      if (aR !== bR) return aR - bR;
      return a.name.localeCompare(b.name);
    });
    return [{ key: 'all' as const, label: 'Tất cả' }, ...sorted.map(c => ({ key: c.category_ID, label: c.name || `#${c.category_ID}` }))];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeCategoryId === 'all'
      ? [...products]
      : products.filter(p => Number(p.categories_ID) === activeCategoryId);

    if (q) {
      list = list.filter(p => `${p.name || ''} ${p.description || ''}`.toLowerCase().includes(q));
    }

    switch (sortKey) {
      case 'price_asc': list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'name_asc': list.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break;
      case 'name_desc': list.sort((a, b) => b.name.localeCompare(a.name, 'vi')); break;
    }
    return list;
  }, [products, activeCategoryId, query, sortKey]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const getCategoryName = (categoryId: number) =>
    categories.find(c => Number(c.category_ID) === Number(categoryId))?.name || '';

  const handleFilterChange = (newCat: CategoryFilter) => {
    setActiveCategoryId(newCat);
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleSortChange = (value: SortKey) => {
    setSortKey(value);
    setPage(1);
  };

  if (productsError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Alert type="error" showIcon message="Lỗi tải sản phẩm" description={(productsError as Error).message} />
      </div>
    );
  }

  return (
    <div className="product-page">
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
            ☕ Khám phá bộ sưu tập
          </p>
          <h1 className="text-white text-4xl md:text-5xl mb-0" style={{ fontFamily: 'var(--font-display)' }}>
            Cà Phê Phan
          </h1>
          <p className="text-amber-100 mt-3 text-base max-w-md mx-auto">
            Rang mộc nguyên chất từ mảnh đất Kon Tum — hương thơm, vị đậm, không tạp chất.
          </p>
        </div>
        {/* decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full opacity-10" style={{ background: '#fff' }} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            className="flex-1"
          />
          <Select<SortKey>
            value={sortKey}
            onChange={handleSortChange}
            className="w-full md:w-52"
            options={[
              { value: 'default', label: 'Mặc định' },
              { value: 'price_asc', label: 'Giá thấp → cao' },
              { value: 'price_desc', label: 'Giá cao → thấp' },
              { value: 'name_asc', label: 'Tên A → Z' },
              { value: 'name_desc', label: 'Tên Z → A' },
            ]}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6" role="tablist">
          {categoryTabs.map(tab => (
            <button
              key={String(tab.key)}
              role="tab"
              aria-selected={activeCategoryId === tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategoryId === tab.key
                  ? 'bg-[#6f4e37] text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-[#6f4e37] border border-[#6f4e37]/30 hover:border-[#6f4e37]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {filteredProducts.length.toLocaleString()} sản phẩm
        </p>

        {/* Product Grid */}
        {productsLoading ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Skeleton active className="rounded-xl overflow-hidden" />
              </Col>
            ))}
          </Row>
        ) : (
          <AnimatePresence mode="wait">
            <Row gutter={[24, 24]} key={`${activeCategoryId}-${query}-${sortKey}-${page}`}>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, idx) => {
                  const categoryName = getCategoryName(p.categories_ID);
                  const imgSrc = getImageSrc(p.image);
                  return (
                    <Col xs={24} sm={12} md={8} key={p?.product_ID ? String(p.product_ID) : `prod-${idx}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.35 }}
                        className="product-card"
                        onClick={() => navigate(`/products/${p.product_ID}`)}
                      >
                        <div className="product-card__media">
                          {!!categoryName && <div className="product-card__badge">{categoryName}</div>}
                          <img
                            src={imgSrc}
                            alt={p.name}
                            onError={e => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
                          />
                        </div>
                        <div className="product-card__body">
                          <h3 className="product-card__name">{p.name}</h3>
                          <p className="product-card__desc">
                            {p.description || 'Cà phê rang mộc nguyên chất, hương thơm đặc trưng.'}
                          </p>
                          <div className="product-card__footer">
                            <div className="product-card__price">{formatPrice(Number(p.price))}</div>
                            <button
                              type="button"
                              className="product-card__add"
                              aria-label="Xem chi tiết"
                              onClick={e => { e.stopPropagation(); navigate(`/products/${p.product_ID}`); }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  );
                })
              ) : (
                <Col span={24} className="text-center py-16 text-gray-400">
                  Không tìm thấy sản phẩm phù hợp
                </Col>
              )}
            </Row>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!productsLoading && filteredProducts.length > PAGE_SIZE && (
          <div className="flex justify-center mt-10">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={filteredProducts.length}
              onChange={p => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
      <Chatbox />
    </div>
  );
};

export default ProductsPage;
