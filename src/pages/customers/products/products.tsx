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
  const head = v.slice(0, 12);
  const mime =
    head.startsWith("/9j/")
      ? "image/jpeg"
      : head.startsWith("iVBOR")
        ? "image/png"
        : head.startsWith("UklGR")
          ? "image/webp"
          : "image/webp";
  return `data:${mime};base64,${v}`;
};

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

const getLocalizedDescription = (
  p: Product,
  t: (key: string, opts?: { defaultValue?: string }) => string,
) =>
  t(`products.descById.${p.product_ID}`, {
    defaultValue: p.description || t("products.defaultDescription"),
  });

const selectClass =
  "w-[200px] min-w-[180px] max-md:w-[min(260px,100%)] [&_.ant-select-selector]:rounded-full";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">(
    "all",
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

        setCategories(Array.isArray(cData) ? cData : []);
      } catch (e: unknown) {
        setError((e as Error)?.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryTabs = useMemo(() => {
    const preferredOrder = ["Robusta", "Arabica", "Blend", "Specialty"];
    const sorted = [...categories].sort((a, b) => {
      const ai = preferredOrder.findIndex(
        (x) => x.toLowerCase() === a.name.toLowerCase(),
      );
      const bi = preferredOrder.findIndex(
        (x) => x.toLowerCase() === b.name.toLowerCase(),
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
        sorted.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""), "vi"),
        );
        break;
      case "name_desc":
        sorted.sort((a, b) =>
          String(b.name || "").localeCompare(String(a.name || ""), "vi"),
        );
        break;
      case "default":
      default:
        break;
    }
    return sorted;
  }, [products, activeCategoryId, query, sortKey]);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        className="m-6"
      />
    );
  }

  return (
    <Layout className="min-h-screen overflow-x-hidden overflow-y-auto bg-[var(--bg-main)]">
      <HeaderPage />

      <Content className="px-[18px] pb-[90px] pt-[104px] max-md:px-4 max-md:pb-16 max-md:pt-24 max-sm:pb-[60px] max-sm:pt-[92px]">
        <div className="mx-auto w-full max-w-[1200px] bg-[var(--bg-surface)] px-[22px] pb-6 pt-7 shadow-[0_14px_36px_rgba(0,0,0,0.08)] max-md:px-4">
          <div className="mb-[18px] mt-1 text-center">
            <div className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {t("products.kicker")}
            </div>
            <h1
              className="m-0 text-[32px] font-medium tracking-wider text-[var(--text-main)] max-md:text-[28px]"
              style={{ fontFamily: "'Viaoda Libre', var(--font-display), serif" }}
            >
              {t("products.title")}
            </h1>
          </div>

          <div className="my-3.5 flex flex-wrap justify-center gap-2.5 max-sm:gap-2">
            <Search
              placeholder={t("products.searchPlaceholder")}
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[min(560px,100%)] [&_.ant-input]:rounded-full"
            />
            <Select
              value={sortKey}
              onChange={(v) => setSortKey(v)}
              className={selectClass}
              options={[
                { value: "default", label: t("products.sort.default") },
                { value: "price_asc", label: t("products.sort.priceAsc") },
                { value: "price_desc", label: t("products.sort.priceDesc") },
                { value: "name_asc", label: t("products.sort.nameAsc") },
                { value: "name_desc", label: t("products.sort.nameDesc") },
              ]}
            />
          </div>

          <div
            className="my-3.5 mb-[26px] flex flex-wrap justify-center gap-2.5 max-sm:gap-2"
            role="tablist"
            aria-label={t("products.filterAria")}
          >
            {categoryTabs.map((tab) => (
              <button
                key={String(tab.key)}
                type="button"
                role="tab"
                aria-selected={activeCategoryId === tab.key}
                className={
                  "cursor-pointer rounded-full border px-4 py-1.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-200 " +
                  (activeCategoryId === tab.key
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-soft)] bg-[var(--bg-surface-2)] text-[var(--text-main)] hover:border-[var(--accent)] max-sm:px-3")
                }
                onClick={() => setActiveCategoryId(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-[18px] text-center text-xs uppercase tracking-wider text-[var(--text-muted)]">
            {productsFiltered.length.toLocaleString()} {t("products.itemsLabel")}
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
                      className="group cursor-pointer overflow-hidden rounded-none border-0 bg-[var(--bg-surface)] shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-[220ms] hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(0,0,0,0.16)] [&_.ant-card-body]:p-0"
                      onClick={() => navigate(`/products/${p.product_ID}`)}
                    >
                      <div
                        className="relative aspect-square w-full overflow-hidden bg-[var(--bg-surface-2)]"
                        onMouseEnter={() => setHoveredId(p.product_ID)}
                        onMouseLeave={() =>
                          setHoveredId((id) =>
                            id === p.product_ID ? null : id,
                          )
                        }
                        onMouseMove={(e) => {
                          const rect = (
                            e.currentTarget as HTMLDivElement
                          ).getBoundingClientRect();
                          const x =
                            ((e.clientX - rect.left) / rect.width) * 100;
                          const y =
                            ((e.clientY - rect.top) / rect.height) * 100;
                          setZoomPos({
                            x: Math.min(100, Math.max(0, x)),
                            y: Math.min(100, Math.max(0, y)),
                          });
                        }}
                      >
                        {!!categoryName && (
                          <div className="absolute left-3 top-3 z-[2] bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wider text-white">
                            {categoryName}
                          </div>
                        )}
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="block h-full w-full object-cover [backface-visibility:hidden] transition-transform duration-200 [transform:translateZ(0)]"
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

                      <div className="px-3.5 pb-3 pt-3.5">
                        <div className="mb-2 flex items-start justify-between gap-2.5">
                          <h3 className="m-0 flex-1 text-[13px] font-bold leading-snug text-[var(--text-main)]">
                            {p.name}
                          </h3>
                          <div className="mt-0.5 shrink-0 text-[11px] text-[var(--text-muted)]">
                            {getWeightLabel(p.name)}
                          </div>
                        </div>

                        <p className="mb-2.5 line-clamp-2 min-h-[34px] text-[11px] leading-normal text-[var(--text-muted)]">
                          {getLocalizedDescription(p, t)}
                        </p>

                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {!!categoryName && (
                            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
                              {categoryName}
                            </span>
                          )}
                          <span className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
                            {t("products.mediumRoast")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2.5">
                          <div className="text-[13px] font-bold text-[var(--text-main)]">
                            {formatPrice(Number(p.price || 0), i18n.language)}
                          </div>

                          <button
                            type="button"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-[#ff4d4f] pb-0.5 text-lg leading-none text-white transition-all duration-200 hover:brightness-105"
                            aria-label={t("products.viewDetailsAria")}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${p.product_ID}`);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })
            ) : (
              <Col
                span={24}
                className="py-[90px] text-center text-[15px] font-semibold text-[var(--text-muted)]"
              >
                {t("products.empty")}
              </Col>
            )}
          </Row>

          {productsFiltered.length > pageSize && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={productsFiltered.length}
                onChange={(pn) => setPage(pn)}
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
