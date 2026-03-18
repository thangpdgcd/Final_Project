import React, { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Table,
  Button,
  InputNumber,
  Typography,
  Space,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";

import HeaderPage from "../../../components/layout/Header"; // ✅ HEADER DÙNG CHUNG
import {
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  CartItem,
} from "../../../api/cartApi";

import "./index.scss";
import Chatbox from "../../../components/chatbox";

const { Content } = Layout;
const { Title } = Typography;

/* ================= utils ================= */
const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`;
};

/* ================= component ================= */
const PageCart: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});

  /* ===== get user_ID ===== */
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
          u?.id,
      );
      return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
    } catch {
      return null;
    }
  }, []);

  /* ===== fetch cart ===== */
  const fetchCart = async () => {
    if (!user_ID) return;
    try {
      setLoading(true);
      const data = await getCartByUserId(user_ID);
      const list = Array.isArray(data) ? data : [];
      setCartItems(list);
      setSelectedItems((prev) =>
        prev.filter((id) => list.some((x) => x.cartitem_ID === id)),
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
      message.warning("Bạn chưa đăng nhập.");
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_ID]);

  /* ===== update quantity ===== */
  const handleUpdateQuantity = async (
    cartitem_ID: number,
    newQuantity: number,
  ) => {
    const qty = Number(newQuantity || 1);
    if (qty < 1 || savingMap[cartitem_ID]) return;

    setCartItems((prev) =>
      prev.map((it) =>
        it.cartitem_ID === cartitem_ID ? { ...it, quantity: qty } : it,
      ),
    );
    setSavingMap((prev) => ({ ...prev, [cartitem_ID]: true }));

    try {
      await updateCartItem(cartitem_ID, { quantity: qty });
      await fetchCart();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Cập nhật thất bại");
      await fetchCart();
    } finally {
      setSavingMap((prev) => ({ ...prev, [cartitem_ID]: false }));
    }
  };

  /* ===== remove item ===== */
  const handleRemoveItem = async (cartitem_ID: number) => {
    try {
      await removeCartItem(cartitem_ID);
      message.success("Đã xoá sản phẩm");
      setSelectedItems((prev) => prev.filter((id) => id !== cartitem_ID));
      await fetchCart();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Xoá thất bại");
    }
  };

  /* ===== table columns ===== */
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
            <div className='product-name'>
              {products?.name || "Không có tên"}
            </div>
            <div className='product-category'>Phân loại: Mặc định</div>
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
          <Space>
            <Button
              disabled={q <= 1 || savingMap[record.cartitem_ID]}
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q - 1)}>
              -
            </Button>

            <InputNumber
              min={1}
              value={q}
              disabled={savingMap[record.cartitem_ID]}
              onChange={(v) =>
                handleUpdateQuantity(record.cartitem_ID, Number(v || 1))
              }
            />

            <Button
              disabled={savingMap[record.cartitem_ID]}
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q + 1)}>
              +
            </Button>
          </Space>
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
        <Button
          danger
          type='link'
          onClick={() => handleRemoveItem(record.cartitem_ID)}>
          Xóa
        </Button>
      ),
    },
  ];

  /* ===== total price ===== */
  const totalPrice = useMemo(() => {
    return cartItems
      .filter((i) => selectedItems.includes(i.cartitem_ID))
      .reduce(
        (sum, item) => sum + (item.products?.price || 0) * (item.quantity || 0),
        0,
      );
  }, [cartItems, selectedItems]);

  /* ================= render ================= */
  return (
    <Layout className='cart-page'>
      {/* ✅ HEADER DÙNG CHUNG */}
      <HeaderPage />

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
            onChange: (keys) => setSelectedItems(keys as number[]),
          }}
        />

        {cartItems.length === 0 && !loading && <p>Giỏ hàng trống</p>}

        {cartItems.length > 0 && (
          <div className='cart-footer'>
            <div className='cart-footer-left'>
              <span>Đã chọn {selectedItems.length} sản phẩm</span>
            </div>

            <div className='cart-footer-right'>
              <div className='cart-total'>
                Tổng cộng:
                <span className='price'>{totalPrice.toLocaleString()}₫</span>
              </div>

              <Button
                type='primary'
                size='large'
                disabled={selectedItems.length === 0}
                onClick={() =>
                  navigate("/orders", {
                    state: {
                      cartItems: cartItems.filter((i) =>
                        selectedItems.includes(i.cartitem_ID),
                      ),
                    },
                  })
                }>
                Mua hàng
              </Button>
            </div>
          </div>
        )}
      </Content>
      <Chatbox />
    </Layout>
  );
};

export default PageCart;
