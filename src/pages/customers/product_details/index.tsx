import React, { useEffect, useMemo, useState } from "react";
import "./index.scss";

import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Divider,
  Select,
  InputNumber,
  Button,
  message,
  Breadcrumb,
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";

import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import { getProductById, Product } from "../../../api/productApi";
import { addToCart, getCartByUserId, CartItem } from "../../../api/cartApi";

const { Header, Content } = Layout;
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

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    about: "/about",
    login: "/login",
    cart: "/cart",
  };

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_ID");
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const menuitems = [
    { key: "home", label: "Home" },
    { key: "products", label: "Coffee" },
    { key: "contact", label: "Contact" },
    { key: "about", label: "About" },
    {
      key: isLoggedIn ? "logout" : "login",
      label: isLoggedIn ? "Log Out" : "Log In",
    },
    {
      key: "cart",
      label: (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "100%",
          }}>
          <ShoppingCartOutlined style={{ fontSize: 20, color: "#fff" }} />
        </span>
      ),
    },
  ];

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

  useEffect(() => {
    const fetchCart = async () => {
      if (!user_ID) {
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
  }, [user_ID]);

  const inStock = useMemo(() => (product?.stock ?? 0) > 0, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!localStorage.getItem("token") || !user_ID) {
      message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!inStock) return message.warning("Sản phẩm đã hết hàng!");
    if (!weight) return message.warning("Vui lòng chọn Khối lượng");
    if (!grind) return message.warning("Vui lòng chọn Phân loại");
    if (cartLoading) return message.info("Đang kiểm tra giỏ hàng...");

    const existed = cartItems.some((it: any) => {
      const pid = it?.products?.product_ID ?? it?.product_ID;
      return Number(pid) === Number(product.product_ID);
    });

    if (existed) {
      message.warning("Sản phẩm này đã có trong giỏ hàng rồi!");
      return;
    }

    try {
      await addToCart({
        user_ID,
        product_ID: product.product_ID,
        quantity: qty,
        price: product.price,
      });

      message.success(`Đã thêm ${qty} sản phẩm vào giỏ`);

      setCartItems((prev: any) => [
        ...prev,
        {
          cartitem_ID: Date.now(),
          cart_ID: 0,
          product_ID: product.product_ID,
          quantity: qty,
          price: product.price * qty,
          products: {
            name: product.name,
            price: product.price,
            image: product.image,
          },
        },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg && /exist|already|đã/i.test(msg)) {
        message.warning("Sản phẩm này đã có trong giỏ hàng rồi!");
        return;
      }
      console.error(err);
      message.error(msg || "Không thể thêm sản phẩm vào giỏ");
    }
  };

  return (
    <Layout className='pd-layout'>
      <Header className='homepage__header pd-header'>
        <div className='homepage__logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home pd-menu'
          selectedKeys={[
            Object.keys(menuRoutes).find(
              (k) => menuRoutes[k] === location.pathname
            ) || "",
          ]}
          items={menuitems}
        />
      </Header>

      <Content className='pd-content'>
        <div className='pd-container'>
          <Breadcrumb className='pd-breadcrumb' />

          <Card className='pd-card' bordered={false}>
            {loading ? (
              <div className='pd-loading'>Đang tải...</div>
            ) : !product ? (
              <Text>Không tìm thấy sản phẩm</Text>
            ) : (
              <Row gutter={[28, 28]} align='top'>
                <Col xs={24} lg={12}>
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
                </Col>

                <Col xs={24} lg={12}>
                  <div className='pd-info'>
                    <Title className='pd-title'>{product.name}</Title>

                    <div className='pd-price'>
                      {Number(product.price || 0).toLocaleString()} đ
                      <span className='pd-price-note'> / sản phẩm</span>
                    </div>

                    <Paragraph className='pd-desc'>
                      {product.description || "Chưa có mô tả."}
                    </Paragraph>

                    <Space size={10} wrap className='pd-tags'>
                      {inStock ? (
                        <Tag color='green'>Còn hàng</Tag>
                      ) : (
                        <Tag color='red'>Hết hàng</Tag>
                      )}
                      <Tag color='blue'>Stock: {product.stock}</Tag>
                    </Space>

                    <Divider className='pd-divider' />

                    <div className='pd-form'>
                      <div className='pd-row'>
                        <div className='pd-label'>Khối lượng</div>
                        <Select
                          className='pd-select'
                          placeholder='Chọn một tùy chọn'
                          value={weight}
                          onChange={setWeight}
                          options={[
                            { value: "250gr", label: "250gr" },
                            { value: "500gr", label: "500gr" },
                          ]}
                        />
                      </div>

                      <div className='pd-row'>
                        <div className='pd-label'>Phân loại</div>
                        <Select
                          className='pd-select'
                          placeholder='Chọn một tùy chọn'
                          value={grind}
                          onChange={setGrind}
                          options={[
                            {
                              value: "Pha phin – Xay vừa",
                              label: "Pha phin – Xay vừa",
                            },
                            {
                              value: "Pha máy – Xay mịn",
                              label: "Pha máy – Xay mịn",
                            },
                            {
                              value: "Cold brew – Xay thô",
                              label: "Cold brew – Xay thô",
                            },
                            { value: "Nguyên hạt", label: "Nguyên hạt" },
                          ]}
                        />
                      </div>

                      <div className='pd-actions'>
                        <InputNumber
                          className='pd-qty'
                          min={1}
                          max={product.stock || 1}
                          value={qty}
                          onChange={(v) => setQty(Number(v || 1))}
                          disabled={!inStock}
                        />
                        <Button
                          className='pd-btn'
                          type='primary'
                          size='large'
                          icon={<ShoppingCartOutlined />}
                          onClick={handleAddToCart}
                          disabled={!inStock}>
                          Thêm vào giỏ hàng
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ProductDetailPage;
