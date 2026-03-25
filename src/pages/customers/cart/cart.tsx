import React, { startTransition, useState, useEffect, useMemo } from "react";
import {
  Layout,
  Table,
  Button,
  InputNumber,
  Typography,
  Space,
  App,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HeaderPage from "../../../components/layout/Header";
import {
  getCartByUserId,
  updateCartItem,
  removeCartItem,
  CartItem,
} from "../../../api/cartApi";

import Chatbox from "../../../components/chatbox";

const { Content } = Layout;
const { Title } = Typography;

const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`;
};

const tableWrapClass =
  "[&_.ant-table-thead>tr>th]:!bg-neutral-100 [&_.ant-table-thead>tr>th]:!text-center [&_.ant-table-thead>tr>th]:!font-semibold [&_.ant-table-thead>tr>th]:!text-black " +
  "[&_.ant-table-tbody>tr>td]:!bg-white [&_.ant-table-tbody>tr>td]:!align-middle [&_.ant-table-tbody>tr>td]:!text-center [&_.ant-table-tbody>tr>td]:!text-black " +
  "[&_.ant-table-content]:!bg-white [&_.ant-checkbox-inner]:!border-black [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-black [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-black";

const PageCart: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          u?.id,
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
        prev.filter((id) => list.some((x) => x.cartitem_ID === id)),
      );
    } catch (err: unknown) {
      message.error(
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("customersCart.loadError"),
      );
      setCartItems([]);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user_ID) {
      message.warning(t("customersCart.notLoggedIn"));
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_ID]);

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
    } catch (err: unknown) {
      message.error(
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("customersCart.updateError"),
      );
      await fetchCart();
    } finally {
      setSavingMap((prev) => ({ ...prev, [cartitem_ID]: false }));
    }
  };

  const handleRemoveItem = async (cartitem_ID: number) => {
    try {
      await removeCartItem(cartitem_ID);
      message.success(t("customersCart.removeSuccess"));
      setSelectedItems((prev) => prev.filter((id) => id !== cartitem_ID));
      await fetchCart();
    } catch (err: unknown) {
      message.error(
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("customersCart.removeError"),
      );
    }
  };

  const columns = [
    {
      title: t("customersCart.columns.product"),
      dataIndex: "products",
      key: "product",
      render: (products: { image?: string; name?: string }) => (
        <div className="flex items-center gap-4 text-left">
          <img
            src={getImageSrc(products?.image)}
            alt={products?.name || t("customersCart.fallback.productAlt")}
            className="h-20 w-20 rounded-md border border-neutral-200 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/no-image.png";
            }}
          />
          <div className="flex flex-col">
            <div className="font-medium text-black">
              {products?.name || t("customersCart.fallback.noName")}
            </div>
            <div className="text-sm text-neutral-500">
              {t("customersCart.fallback.categoryLabel")}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("customersCart.columns.unitPrice"),
      dataIndex: ["products", "price"],
      key: "price",
      render: (price: number) => (
        <span className="font-semibold text-[#d4380d]">
          {Number(price || 0).toLocaleString()}₫
        </span>
      ),
    },
    {
      title: t("customersCart.columns.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => {
        const q = Number(quantity || 1);
        return (
          <Space>
            <Button
              disabled={q <= 1 || savingMap[record.cartitem_ID]}
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q - 1)}
            >
              -
            </Button>

            <InputNumber
              min={1}
              value={q}
              disabled={savingMap[record.cartitem_ID]}
              className="w-20 [&_.ant-input-number-input]:text-black"
              onChange={(v) =>
                handleUpdateQuantity(record.cartitem_ID, Number(v || 1))
              }
            />

            <Button
              disabled={savingMap[record.cartitem_ID]}
              onClick={() => handleUpdateQuantity(record.cartitem_ID, q + 1)}
            >
              +
            </Button>
          </Space>
        );
      },
    },
    {
      title: t("customersCart.columns.total"),
      key: "total",
      render: (_: unknown, record: CartItem) => (
        <span className="font-semibold text-[#d4380d]">
          {(
            (record.products?.price || 0) * (record.quantity || 0)
          ).toLocaleString()}
          ₫
        </span>
      ),
    },
    {
      title: t("customersCart.columns.actions"),
      key: "action",
      render: (_: unknown, record: CartItem) => (
        <Button
          danger
          type="link"
          className="!font-medium hover:!text-[#ff4d4f]"
          onClick={() => handleRemoveItem(record.cartitem_ID)}
        >
          {t("customersCart.actions.remove")}
        </Button>
      ),
    },
  ];

  const totalPrice = useMemo(() => {
    return cartItems
      .filter((i) => selectedItems.includes(i.cartitem_ID))
      .reduce(
        (sum, item) => sum + (item.products?.price || 0) * (item.quantity || 0),
        0,
      );
  }, [cartItems, selectedItems]);

  return (
    <Layout className="min-h-screen bg-[var(--bg-main)]">
      <HeaderPage />

      <Content className="px-6 py-6">
        <div className="rounded-lg bg-white p-6 text-black shadow-sm">
          <Title level={3} className="!mb-6 !text-black">
            {t("customersCart.title")}
          </Title>

          <Table
            loading={loading}
            columns={columns as never}
            dataSource={cartItems}
            rowKey="cartitem_ID"
            pagination={false}
            className={`overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${tableWrapClass}`}
            rowSelection={{
              selectedRowKeys: selectedItems,
              onChange: (keys) => setSelectedItems(keys as number[]),
            }}
          />

          {cartItems.length === 0 && !loading && (
            <p className="mt-8 text-center text-neutral-500">
              {t("customersCart.empty")}
            </p>
          )}

          {cartItems.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4 text-black">
              <div className="flex flex-wrap items-center gap-4">
                <span className="cursor-pointer font-medium">
                  {t("customersCart.selectedItems", {
                    count: selectedItems.length,
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="text-base">
                  {t("customersCart.totalLabel")}
                  <span className="ml-1 font-semibold text-[#d4380d]">
                    {totalPrice.toLocaleString()}₫
                  </span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  disabled={selectedItems.length === 0}
                  onClick={() =>
                    startTransition(() => {
                      navigate("/orders", {
                        state: {
                          cartItems: cartItems.filter((i) =>
                            selectedItems.includes(i.cartitem_ID),
                          ),
                        },
                      });
                    })
                  }
                >
                  {t("customersCart.checkout")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Content>
      <Chatbox />
    </Layout>
  );
};

export default PageCart;
