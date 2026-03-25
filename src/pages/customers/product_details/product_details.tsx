import React, { useEffect, useMemo, useState } from "react";

import {
  Layout,
  Card,
  Typography,
  Tag,
  Space,
  Divider,
  Select,
  InputNumber,
  Button,
  App,
} from "antd";
import { ExpandOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getProductById, Product } from "../../../api/productApi";
import { addToCart, getCartByUserId, CartItem } from "../../../api/cartApi";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/layout/Header";
import FooterPage from "../../../components/layout/Footer";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const selectUiClass =
  "w-full [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-[10px] [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!bg-gray-50 " +
  "[&_.ant-select-selection-placeholder]:!text-gray-400 [&_.ant-select-arrow]:!text-gray-400";

const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`;
};

const getUserIdFromStorage = (): number | null => {
  const rawId = localStorage.getItem("user_ID");
  const id = Number(rawId);
  if (Number.isFinite(id) && id > 0) return id;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    const u = JSON.parse(rawUser);
    const fallback = Number(
      u?.user_ID ?? u?.data?.user_ID ?? u?.user?.user_ID ?? u?.user?.id ?? u?.id,
    );
    return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
  } catch {
    return null;
  }
};

const ProductDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token"),
  );

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [qty, setQty] = useState<number>(1);
  const [weight, setWeight] = useState<string | undefined>(undefined);
  const [grind, setGrind] = useState<string | undefined>(undefined);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "brewing"
  >("description");

  const user_ID = useMemo(() => getUserIdFromStorage(), []);

  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getProductById(Number(id));
        setProduct(data);
        setQty(1);
        setWeight(undefined);
        setGrind(undefined);
      } catch (err: unknown) {
        message.error((err as Error)?.message || "Load product failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user_ID || !localStorage.getItem("token")) {
        setCartItems([]);
        return;
      }
      try {
        setCartLoading(true);
        const data = await getCartByUserId(user_ID);
        setCartItems(Array.isArray(data) ? data : []);
      } catch {
        setCartItems([]);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [user_ID, isLoggedIn]);

  const inStock = useMemo(() => (product?.stock ?? 0) > 0, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!localStorage.getItem("token") || !user_ID) {
      message.warning("Please log in to add items to your cart");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!inStock) return message.warning("This product is out of stock!");
    if (!weight) return message.warning("Please select a weight");
    if (!grind) return message.warning("Please select a grind option");
    if (cartLoading) return message.info("Checking your cart...");

    const existed = cartItems.some((it: CartItem & { products?: { product_ID?: number } }) => {
      const pid = it?.products?.product_ID ?? (it as { product_ID?: number }).product_ID;
      return Number(pid) === Number(product.product_ID);
    });

    if (existed) {
      message.warning("This product is already in your cart!");
      return;
    }

    try {
      await addToCart({
        user_ID,
        product_ID: product.product_ID,
        quantity: qty,
        price: product.price,
      });

      message.success(`Added ${qty} item${qty > 1 ? "s" : ""} to cart`);

      setCartItems((prev) => [
        ...prev,
        {
          cartitem_ID: Date.now(),
          cart_ID: 0,
          product_ID: product.product_ID,
          quantity: qty,
          price: product.price * qty,
          products: {
            product_ID: product.product_ID,
            name: product.name,
            price: product.price,
            image: product.image,
          },
        } as CartItem,
      ]);
      navigate("/carts");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg && /exist|already|đã/i.test(msg)) {
        message.warning("This product is already in your cart!");
        return;
      }
      console.error(err);
      message.error(msg || "Unable to add this product to your cart");
    }
  };

  const tabBtn = (key: typeof activeTab, label: string) => (
    <button
      type="button"
      className={
        "relative cursor-pointer border-0 bg-transparent py-2 pb-3.5 text-xs font-bold uppercase tracking-widest transition-colors " +
        (activeTab === key
          ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-orange-600 after:content-['']"
          : "text-gray-400 hover:text-gray-500")
      }
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  return (
    <Layout className="min-h-screen bg-[var(--bg-main)]">
      <HeaderPage />

      <Content className="px-4 pb-12 pt-24 max-sm:pt-20">
        <div className="mx-auto w-full max-w-[1080px] px-4">
          <Card
            bordered={false}
            className="rounded-[18px] border-none bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] [&_.ant-card-body]:px-6 [&_.ant-card-body]:py-6 max-sm:[&_.ant-card-body]:px-4 sm:[&_.ant-card-body]:px-7 sm:[&_.ant-card-body]:pb-7"
          >
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center text-gray-500">
                Loading...
              </div>
            ) : !product ? (
              <Text>Product not found</Text>
            ) : (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
                <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
                  <img
                    className="block w-full rounded-[18px] border-2 border-gray-900 object-contain lg:h-[460px] max-lg:h-[380px] max-sm:h-[320px]"
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/no-image.png";
                    }}
                  />
                  <button
                    className="absolute right-3.5 top-3.5 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-slate-900/10 bg-white/90 text-gray-800 shadow-sm transition hover:-translate-y-px hover:bg-white hover:shadow-md"
                    type="button"
                    aria-label={t("products.zoomAria")}
                    onClick={() =>
                      window.open(getImageSrc(product.image), "_blank")
                    }
                  >
                    <ExpandOutlined />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Title className="!m-0 !text-3xl !font-extrabold !text-gray-900 max-sm:!text-2xl">
                    {product.name}
                  </Title>

                  <div className="mt-0.5 text-[22px] font-bold text-gray-900">
                    {Number(product.price || 0).toLocaleString()} ₫
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      {" "}
                      / item
                    </span>
                  </div>

                  <Paragraph className="!mt-1 !text-gray-600">
                    {product.description || "No description available."}
                  </Paragraph>

                  <Space size={10} wrap className="!mt-1">
                    {inStock ? (
                      <Tag color="green">In stock</Tag>
                    ) : (
                      <Tag color="red">Out of stock</Tag>
                    )}
                    <Tag color="blue">Stock: {product.stock}</Tag>
                  </Space>

                  <Divider className="!my-3" />

                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)]">
                      <div className="text-[13px] font-bold uppercase tracking-wide text-gray-500">
                        Weight
                      </div>
                      <Select
                        className={selectUiClass}
                        placeholder={t("products.selectOptionPlaceholder")}
                        value={weight}
                        onChange={setWeight}
                        options={[
                          { value: "250g", label: "250g" },
                          { value: "500g", label: "500g" },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)]">
                      <div className="text-[13px] font-bold uppercase tracking-wide text-gray-500">
                        Grind
                      </div>
                      <Select
                        className={selectUiClass}
                        placeholder={t("products.selectOptionPlaceholder")}
                        value={grind}
                        onChange={setGrind}
                        options={[
                          {
                            value: "Phin drip – Medium grind",
                            label: "Phin drip – Medium grind",
                          },
                          {
                            value: "Espresso machine – Fine grind",
                            label: "Espresso machine – Fine grind",
                          },
                          {
                            value: "Cold brew – Coarse grind",
                            label: "Cold brew – Coarse grind",
                          },
                          { value: "Whole beans", label: "Whole beans" },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                      <InputNumber
                        className="!h-11 w-full [&_.ant-input-number-input]:!h-[42px]"
                        min={1}
                        max={product.stock || 1}
                        value={qty}
                        onChange={(v) => setQty(Number(v || 1))}
                        disabled={!inStock}
                      />
                      <Button
                        className="!h-11 !rounded-[10px] !border-none !bg-blue-600 !text-sm !font-bold !shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:!-translate-y-px hover:!bg-blue-700 hover:!shadow-[0_18px_46px_rgba(37,99,235,0.45)] active:!translate-y-0"
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        disabled={!inStock}
                      >
                        Add to cart
                      </Button>
                    </div>

                    <div className="relative mt-3 flex items-start gap-2 rounded-[10px] border border-amber-200 bg-orange-50 pl-8 pr-3 py-2.5 text-xs text-amber-900 before:absolute before:left-2 before:top-2.5 before:flex before:h-[18px] before:w-[18px] before:items-center before:justify-center before:rounded-full before:bg-amber-300 before:text-xs before:font-bold before:text-amber-900 before:content-['!']">
                      <span>
                        Free shipping on orders over 2,000,000 ₫. Beans are
                        roasted fresh every Tuesday for peak flavor.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {!loading && product && (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap gap-8 border-b border-gray-200">
                {tabBtn("description", "DESCRIPTION")}
                {tabBtn("reviews", "REVIEWS (12)")}
                {tabBtn("brewing", "BREWING GUIDE")}
              </div>

              {activeTab === "description" && (
                <>
                  <Paragraph className="!max-w-[900px] !text-sm !text-gray-600">
                    Sourced from the high-altitude volcanic soils of Kon Tum,
                    our Arabica Blend represents the pinnacle of Vietnamese
                    coffee craftsmanship. This meticulously selected lot is
                    dry-processed to enhance its natural sweetness and complex
                    fruit profile.
                  </Paragraph>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white px-[18px] pb-4 pt-[18px]">
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        ORIGIN
                      </div>
                      <div className="text-sm leading-relaxed text-gray-900">
                        Kon Tum, Central Highlands, Vietnam
                        <br />
                        (1,500m ASL)
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-[18px] pb-4 pt-[18px]">
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        NOTES
                      </div>
                      <div className="text-sm leading-relaxed text-gray-900">
                        Dark chocolate, roasted hazelnut, Meyer lemon
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-[18px] pb-4 pt-[18px]">
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        ROAST
                      </div>
                      <div className="text-sm leading-relaxed text-gray-900">
                        Medium-light (City+)
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "reviews" && (
                <Paragraph className="!max-w-[900px] !text-sm !text-gray-600">
                  Customer reviews will be available here soon.
                </Paragraph>
              )}

              {activeTab === "brewing" && (
                <Paragraph className="!max-w-[900px] !text-sm !text-gray-600">
                  Brewing guide coming soon. We recommend starting with a 1:15
                  coffee-to-water ratio and adjusting to taste.
                </Paragraph>
              )}
            </div>
          )}
        </div>
      </Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default ProductDetailPage;
