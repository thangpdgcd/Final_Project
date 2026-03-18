import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Spin,
  Alert,
  Layout,
  Input,
  Select,
  Pagination,
} from "antd";
import { useNavigate } from "react-router-dom";
import "./index.scss";

import HeaderPage from "../../../components/layout/Header";
import { getAllProducts, Product } from "../../../api/productApi";
import { getAllCategories, type Category } from "../../../api/categoriesApi";

import FooterPage from "../../../components/layout/Footer";
import Chatbox from "../../../components/chatbox";
import { useTranslation } from "react-i18next";

const { Content } = Layout;
const { Search } = Input;

const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  // Try to infer base64 mime (helps browser decode correctly)
  const head = v.slice(0, 12);
  const mime =
    head.startsWith("/9j/") ? "image/jpeg" : // jpeg
    head.startsWith("iVBOR") ? "image/png" : // png
    head.startsWith("UklGR") ? "image/webp" : // webp (RIFF)
    "image/webp";
  return `data:${mime};base64,${v}`;
};

const normalizeCategory = (record: any): Category => ({
  category_ID: Number(record?.category_ID ?? record?.ID ?? record?.id ?? 0),
  name: String(record?.name ?? record?.Name ?? ""),
  description: record?.description ?? record?.Description ?? undefined,
});

const getWeightLabel = (name?: string) => {
  const v = (name || "").toLowerCase();
  const m =
    v.match(/(\d+)\s?g\b/i) ||
    v.match(/(\d+(?:\.\d+)?)\s?kg\b/i) ||
    v.match(/\b(\d+)\s?gr\b/i);
  if (!m) return "500g";
  const raw = m[0].replace(/\s+/g, "");
  return raw.toLowerCase().includes("kg") ? raw.toUpperCase() : raw;
};

const formatPrice = (value: number, lang: string) => {
  const locale = lang === "en" ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const getLocalizedDescription = (p: Product, t: (key: string, opts?: any) => string) =>
  t(`products.descById.${p.product_ID}`, {
    defaultValue: p.description || t("products.defaultDescription"),
  });

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all"
  );
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "default" | "price_asc" | "price_desc" | "name_asc" | "name_desc"
  >("default");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const [pData, cData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);

        setProducts(Array.isArray(pData) ? pData : []);

        const rawList = Array.isArray(cData) ? cData : cData?.categories ?? [];
        const normalized = (Array.isArray(rawList) ? rawList : [])
          .map(normalizeCategory)
          .filter((c) => Number.isFinite(c.category_ID) && c.category_ID > 0);
        setCategories(normalized);
      } catch (e: any) {
        setError(e?.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryTabs = useMemo(() => {
    const preferredOrder = ["Robusta", "Arabica", "Blend", "Specialty"];
    const sorted = [...categories].sort((a, b) => {
      const ai = preferredOrder.findIndex(
        (x) => x.toLowerCase() === a.name.toLowerCase()
      );
      const bi = preferredOrder.findIndex(
        (x) => x.toLowerCase() === b.name.toLowerCase()
      );
      const aRank = ai === -1 ? 999 : ai;
      const bRank = bi === -1 ? 999 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });

    return [
      { key: "all" as const, label: t("products.tabs.all") },
      ...sorted.map((c) => ({
        key: c.category_ID,
        label: c.name || `#${c.category_ID}`,
      })),
    ];
  }, [categories, t]);

  const productsFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategory =
      activeCategoryId === "all"
        ? products
        : products.filter((p) => Number(p.categories_ID) === activeCategoryId);

    const byQuery = !q
      ? byCategory
      : byCategory.filter((p) => {
          const hay = `${p.name || ""} ${p.description || ""}`.toLowerCase();
          return hay.includes(q);
        });

    const sorted = [...byQuery];
    switch (sortKey) {
      case "price_asc":
        sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price_desc":
        sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "name_asc":
        sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));
        break;
      case "name_desc":
        sorted.sort((a, b) => String(b.name || "").localeCompare(String(a.name || ""), "vi"));
        break;
      case "default":
      default:
        break;
    }
    return sorted;
  }, [products, activeCategoryId, query, sortKey]);

  // Reset về trang 1 khi filter/search thay đổi để tránh vượt quá tổng trang
  useEffect(() => {
    setPage(1);
  }, [activeCategoryId, query, sortKey]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return productsFiltered.slice(start, start + pageSize);
  }, [productsFiltered, page, pageSize]);

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => Number(c.category_ID) === Number(categoryId))?.name ||
    "";

  if (loading) {
    return (
      <div className='page-loading'>
        <Spin size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message='Lỗi'
        description={error}
        type='error'
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <Layout className='product-page'>
      <HeaderPage />

      <Content className='product-page__content'>
        <div className='product-page__container'>
         

          {/* Title */}
          <div className='product-page__heading'>
            <div className='product-page__kicker'>
              {t("products.kicker")}
            </div>
            <h1 className='product-page__title'>
              {t("products.title")}
            </h1>
          </div>

          {/* Controls */}
          <div className='product-page__controls'>
            <Search
              placeholder={t("products.searchPlaceholder")}
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='product-page__search'
            />
            <Select
              value={sortKey}
              onChange={(v) => setSortKey(v)}
              className='product-page__sort'
              options={[
                { value: "default", label: t("products.sort.default") },
                { value: "price_asc", label: t("products.sort.priceAsc") },
                { value: "price_desc", label: t("products.sort.priceDesc") },
                { value: "name_asc", label: t("products.sort.nameAsc") },
                { value: "name_desc", label: t("products.sort.nameDesc") },
              ]}
            />
          </div>

          {/* Tabs */}
          <div className='product-page__tabs' role='tablist' aria-label='Bộ lọc'>
            {categoryTabs.map((t) => (
              <button
                key={String(t.key)}
                type='button'
                role='tab'
                aria-selected={activeCategoryId === t.key}
                className={`product-page__tab ${
                  activeCategoryId === t.key ? "active" : ""
                }`}
                onClick={() => setActiveCategoryId(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className='product-page__meta'>
            {productsFiltered.length.toLocaleString()}{" "}
            {t("products.itemsLabel")}
          </div>

          <Row gutter={[26, 28]}>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const categoryName = getCategoryName(p.categories_ID);
                const imgSrc = getImageSrc(p.image);
                const isZoomed = hoveredId === p.product_ID;
                return (
                  <Col xs={24} sm={12} md={8} lg={8} key={p.product_ID}>
                    <Card
                      hoverable
                      className='product-card'
                      onClick={() => navigate(`/products/${p.product_ID}`)}>
                      {/* IMAGE */}
                      <div
                        className='product-card__media'
                        onMouseEnter={() => setHoveredId(p.product_ID)}
                        onMouseLeave={() =>
                          setHoveredId((id) => (id === p.product_ID ? null : id))
                        }
                        onMouseMove={(e) => {
                          const rect = (
                            e.currentTarget as HTMLDivElement
                          ).getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setZoomPos({
                            x: Math.min(100, Math.max(0, x)),
                            y: Math.min(100, Math.max(0, y)),
                          });
                        }}>
                        {!!categoryName && (
                          <div className='product-card__badge'>
                            {categoryName}
                          </div>
                        )}
                        <img
                          src={imgSrc}
                          alt={p.name}
                          style={
                            isZoomed
                              ? {
                                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                  transform: "scale(1.7)",
                                }
                              : undefined
                          }
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/no-image.png";
                          }}
                        />
                      </div>

                      {/* BODY */}
                      <div className='product-card__body'>
                        <div className='product-card__titleRow'>
                          <h3 className='product-card__name'>{p.name}</h3>
                          <div className='product-card__weight'>
                            {getWeightLabel(p.name)}
                          </div>
                        </div>

                        <p className='product-card__desc'>
                          {getLocalizedDescription(p, t)}
                        </p>

                        <div className='product-card__chips'>
                          {!!categoryName && <span>{categoryName}</span>}
                          <span>{t("products.mediumRoast")}</span>
                        </div>

                        <div className='product-card__footer'>
                          <div className='product-card__price'>
                            {formatPrice(Number(p.price || 0), i18n.language)}
                          </div>

                          <button
                            type='button'
                            className='product-card__add'
                            aria-label='Xem chi tiết'
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${p.product_ID}`);
                            }}>
                            +
                          </button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })
            ) : (
              <Col span={24} className='empty-text'>
                {t("products.empty")}
              </Col>
            )}
          </Row>

          {/* Pagination */}
          {productsFiltered.length > pageSize && (
            <div className='product-page__pagination'>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={productsFiltered.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default ProductList;
