import React, { useEffect, useMemo, useState } from "react";
import "./index.scss";

import { Layout, Card, Typography, Tag, Space, Divider, Select, InputNumber, Button, message, Breadcrumb } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";

import { getProductById, Product } from "../../../api/productApi";
import { addToCart, getCartByUserId, CartItem } from "../../../api/cartApi";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/header";
import FooterPage from "../../../components/footer";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

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
      u?.user_ID ?? u?.data?.user_ID ?? u?.user?.user_ID ?? u?.user?.id ?? u?.id
    );
    return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
  } catch {
    return null;
  }
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [qty, setQty] = useState<number>(1);
  const [weight, setWeight] = useState<string | undefined>(undefined);
  const [grind, setGrind] = useState<string | undefined>(undefined);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const user_ID = useMemo(() => getUserIdFromStorage(), []);

  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Load product
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
      } catch (err: any) {
        message.error(err?.message || "Load product failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load cart for badge + check existed
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

    const existed = cartItems.some((it: any) => {
      const pid = it?.products?.product_ID ?? it?.product_ID;
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

      // ✅ update badge/cartItems ngay lập tức
      setCartItems((prev: any) => [
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
        },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg && /exist|already|đã/i.test(msg)) {
        message.warning("This product is already in your cart!");
        return;
      }
      console.error(err);
      message.error(msg || "Unable to add this product to your cart");
    }
  };

  return (
    <Layout className='pd-layout'>
      <HeaderPage />

      <Content className='pd-content'>
        <div className='product-detail'>
          <Breadcrumb className='pd-breadcrumb'>
            <Breadcrumb.Item>
              <span className='pd-link' onClick={() => navigate("/")}>
                Home
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span className='pd-link' onClick={() => navigate("/products")}>
                Coffee
              </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{product?.name || "Details"}</Breadcrumb.Item>
          </Breadcrumb>

          <Card className='pd-card' bordered={false}>
            {loading ? (
              <div className='pd-loading'>Loading...</div>
            ) : !product ? (
              <Text>Product not found</Text>
            ) : (
              <div className='pd-grid'>
                <div className='pd-media'>
                  <img
                    className='pd-image'
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/no-image.png";
                    }}
                  />
                  <button
                    className='pd-zoom'
                    type='button'
                    aria-label='Zoom'
                    onClick={() =>
                      window.open(getImageSrc(product.image), "_blank")
                    }
                  />
                </div>

                <div className='pd-info'>
                  <Title className='pd-title'>{product.name}</Title>

                  <div className='pd-price'>
                    {Number(product.price || 0).toLocaleString()} ₫
                    <span className='pd-price-note'> / item</span>
                  </div>

                  <Paragraph className='pd-desc'>
                    {product.description || "No description available."}
                  </Paragraph>

                  <Space size={10} wrap className='pd-tags'>
                    {inStock ? (
                      <Tag color='green'>In stock</Tag>
                    ) : (
                      <Tag color='red'>Out of stock</Tag>
                    )}
                    <Tag color='blue'>Stock: {product.stock}</Tag>
                  </Space>

                  <Divider className='pd-divider' />

                  <div className='pd-form'>
                    <div className='pd-option-row'>
                      <div className='pd-option-label'>Weight</div>
                      <Select
                        className='pd-select'
                        placeholder='Select an option'
                        value={weight}
                        onChange={setWeight}
                        options={[
                          { value: "250g", label: "250g" },
                          { value: "500g", label: "500g" },
                        ]}
                      />
                    </div>

                    <div className='pd-option-row'>
                      <div className='pd-option-label'>Grind</div>
                      <Select
                        className='pd-select'
                        placeholder='Select an option'
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

                    <div className='pd-qty-row'>
                      <InputNumber
                        className='pd-qty'
                        min={1}
                        max={product.stock || 1}
                        value={qty}
                        onChange={(v) => setQty(Number(v || 1))}
                        disabled={!inStock}
                      />
                      <Button
                        className='pd-add-btn'
                        type='primary'
                        size='large'
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        disabled={!inStock}>
                        Add to cart
                      </Button>
                    </div>

                    <div className='pd-shipping-note'>
                      <span className='pd-shipping-dot' />
                      <span className='pd-shipping-text'>
                        Free shipping on orders over 2,000,000 ₫. Beans are
                        roasted fresh every Tuesday for peak flavor.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default ProductDetailPage;
