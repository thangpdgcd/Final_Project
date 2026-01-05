import React, { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Menu,
  Button,
  Table,
  InputNumber,
  Typography,
  Space,
  message,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  CartItem,
} from "../../../api/cartApi";
import { ShoppingCartOutlined } from "@ant-design/icons";
import SearchComponent from "../../../pages/search";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`;
};

const PageCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});

  const user_ID = useMemo(() => {
    const raw = localStorage.getItem("user_ID");
    const id = Number(raw);
    if (Number.isFinite(id) && id > 0) return id;

    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    try {
      const u = JSON.parse(rawUser);
      const fallback = Number(
        u?.user_ID ??
          u?.data?.user_ID ??
          u?.user?.user_ID ??
          u?.user?.id ??
          u?.id
      );
      return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
    } catch {
      return null;
    }
  }, []);

  const fetchCart = async () => {
    if (!user_ID) return;
    try {
      setLoading(true);
      const data = await getCartByUserId(user_ID);
      const list = Array.isArray(data) ? data : [];
      setCartItems(list);
      setSelectedItems((prev) =>
        prev.filter((id) => list.some((x) => x.cartitem_ID === id))
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tải giỏ hàng");
      setCartItems([]);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user_ID) {
      setCartItems([]);
      setSelectedItems([]);
      message.warning("Bạn chưa đăng nhập hoặc thiếu user_ID.");
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_ID]);

  const handleUpdateQuantity = async (
    cartitem_ID: number,
    newQuantity: number
  ) => {
    const qty = Number(newQuantity || 1);
    if (qty < 1) return;
    if (savingMap[cartitem_ID]) return;

    setCartItems((prev) =>
      prev.map((it) =>
        it.cartitem_ID === cartitem_ID ? { ...it, quantity: qty } : it
      )
    );

    setSavingMap((prev) => ({ ...prev, [cartitem_ID]: true }));

    try {
      await updateCartItem(cartitem_ID, { quantity: qty });
      await fetchCart();
      message.success("Đã cập nhật số lượng");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Cập nhật số lượng thất bại"
      );
      await fetchCart();
    } finally {
      setSavingMap((prev) => ({ ...prev, [cartitem_ID]: false }));
    }
  };

  const handleRemoveItem = async (cartitem_ID: number) => {
    try {
      await removeCartItem(cartitem_ID);
      message.success("Đã xoá sản phẩm khỏi giỏ");
      setSelectedItems((prev) => prev.filter((id) => id !== cartitem_ID));
      await fetchCart();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Xoá sản phẩm thất bại");
    }
  };

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    login: "/login",
    about: "/about",
    cart: "/cart",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const menuitems = [
    { key: "home", label: "Home" },
    { key: "products", label: "Coffee" },
    { key: "contact", label: "Contact" },
    { key: "about", label: "About" },
    { key: "login", label: "Log In" },
    {
      key: "cart",
      label: (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "100%",
          }}>
          <ShoppingCartOutlined style={{ fontSize: 20, color: "#000" }} />
        </span>
      ),
    },
  ];

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "products",
      key: "product",
      render: (products: any) => (
        <div className='product-cell'>
          <img
            src={getImageSrc(products?.image)}
            alt={products?.name || "product"}
            className='product-img'
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/no-image.png";
            }}
          />
          <div className='product-info'>
            <span className='product-name'>
              {products?.name || "Không có tên"}
            </span>
            <span className='product-category'>Phân loại: Mặc định</span>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: ["products", "price"],
      key: "price",
      render: (price: number) => (
        <span className='price'>{Number(price || 0).toLocaleString()}₫</span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => {
        const q = Number(quantity || 1);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q - 1)}
              disabled={q <= 1 || savingMap[record.cartitem_ID]}>
              -
            </Button>

            <InputNumber
              min={1}
              value={q}
              disabled={savingMap[record.cartitem_ID]}
              onChange={(v) =>
                handleUpdateQuantity(record.cartitem_ID, Number(v || 1))
              }
              style={{ width: 70 }}
            />

            <Button
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q + 1)}
              disabled={savingMap[record.cartitem_ID]}>
              +
            </Button>
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_: any, record: CartItem) => (
        <span className='total'>
          {(
            (record.products?.price || 0) * (record.quantity || 0)
          ).toLocaleString()}
          ₫
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: CartItem) => (
        <Space>
          <Button
            type='link'
            danger
            onClick={() => handleRemoveItem(record.cartitem_ID)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(
      checked ? cartItems.map((i) => Number(i.cartitem_ID)) : []
    );
  };

  const totalPrice = useMemo(() => {
    return cartItems
      .filter((i) => selectedItems.includes(i.cartitem_ID))
      .reduce(
        (sum, item) => sum + (item.products?.price || 0) * (item.quantity || 0),
        0
      );
  }, [cartItems, selectedItems]);

  return (
    <Layout className='cart-page'>
      <Header className='homepage__header'>
        <div className='homepage__logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <SearchComponent />

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          selectedKeys={[
            Object.keys(menuRoutes).find(
              (k) => menuRoutes[k] === location.pathname
            ) || "",
          ]}
          items={menuitems}
        />
      </Header>

      <Content className='cart-container'>
        <Title level={3}>🛒 Giỏ hàng của bạn</Title>

        <Table
          loading={loading}
          columns={columns as any}
          dataSource={cartItems}
          rowKey='cartitem_ID'
          pagination={false}
          className='cart-table'
          rowSelection={{
            selectedRowKeys: selectedItems,
            preserveSelectedRowKeys: true,
            onChange: (keys: any) => setSelectedItems(keys as number[]),
          }}
        />

        {cartItems.length === 0 && !loading && <p>Giỏ hàng trống</p>}

        {cartItems.length > 0 && (
          <div className='cart-footer'>
            <div className='cart-footer-left'>
              <input
                type='checkbox'
                checked={
                  cartItems.length > 0 &&
                  selectedItems.length === cartItems.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span>Chọn Tất Cả ({cartItems.length})</span>
            </div>

            <div className='cart-footer-right'>
              <div className='cart-summary'>
                <div className='cart-total-text'>
                  Tổng cộng ({selectedItems.length} sản phẩm):{" "}
                  <span className='cart-total-price'>
                    {totalPrice.toLocaleString()}₫
                  </span>
                </div>

                <Button
                  type='primary'
                  size='large'
                  className='checkout-btn'
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    const selectedCartItems = cartItems.filter((item) =>
                      selectedItems.includes(item.cartitem_ID)
                    );
                    navigate("/orders", {
                      state: { cartItems: selectedCartItems },
                    });
                  }}>
                  Mua Hàng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default PageCart;
