import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Alert,
  Empty,
  Card,
  Space,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
const logo = "/assets/img/logo_PhanCoffee.jpg";

import FooterPage from "../../../components/layout/Footer";
import Chatbox from "../../../components/chatbox";
import { useTranslation } from "react-i18next";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type AnyObj = Record<string, unknown>;

const LAST_ORDER_KEY = "last_order_payload";

const menuClass =
  "ml-auto border-0 bg-transparent max-lg:!w-full [&_.ant-menu-item]:!mx-1 [&_.ant-menu-item]:!rounded-[10px] [&_.ant-menu-item]:!border-b-0 [&_.ant-menu-item-selected]:!bg-black/[0.04] [&_.ant-menu-item-selected]:!text-gray-900 [&_.ant-menu-item::after]:!border-b-0";

const OrdersPageHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "pending"
    | "shipping"
    | "waiting"
    | "completed"
    | "cancelled"
    | "refund"
  >("all");
  const [searchText, setSearchText] = useState("");

  const orderDataFromState = (location.state as AnyObj)?.orderData || null;
  const createdFromState = (location.state as AnyObj)?.created || null;

  const fallback = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const orderData =
    (orderDataFromState as AnyObj | null) ||
    (fallback as AnyObj)?.orderData ||
    null;
  const created =
    (createdFromState as AnyObj | null) ||
    (fallback as AnyObj)?.created ||
    null;

  type LineItem = {
    quantity?: number;
    products?: { name?: string; price?: number; categoryName?: string };
  };

  const cartItems = ((orderData as AnyObj)?.cartItems as LineItem[]) || [];

  const displayedItems = useMemo(() => {
    let list = [...cartItems];

    if (searchText.trim()) {
      const kw = searchText.toLowerCase();
      list = list.filter((item) => {
        const name = String(item?.products?.name || "").toLowerCase();
        return name.includes(kw);
      });
    }

    return list;
  }, [cartItems, searchText]);

  const totalVND = useMemo(() => {
    return displayedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.products?.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [displayedItems]);

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    about: "/about",
    login: "/login",
    carts: "/carts",
    orders: "/history-orders",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const menuItems = [
    { key: "home", label: "Home" },
    { key: "products", label: "Coffee" },
    { key: "contact", label: "Contact" },
    { key: "about", label: "About" },
    { key: "login", label: "Log In" },
    { key: "orders", label: "Orders" },
    {
      key: "carts",
      label: (
        <span className="inline-flex items-center">
          <ShoppingCartOutlined className="!text-xl !text-black" />
        </span>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-neutral-100">
      <Header className="sticky top-0 z-50 flex h-[72px] flex-wrap items-center gap-4 border-b border-black/[0.06] bg-white px-[18px] max-lg:h-auto max-lg:py-3 max-sm:px-3.5">
        <div className="flex min-w-[210px] items-center gap-2.5 max-lg:min-w-0">
          <img
            src={logo}
            alt="Phan Coffee"
            className="h-11 w-11 rounded-[10px] border border-black/[0.06] object-cover max-sm:h-10 max-sm:w-10"
          />
          <span className="text-lg font-bold tracking-wide text-gray-900 max-sm:text-base">
            Phan Coffee
          </span>
        </div>

        <Menu
          mode="horizontal"
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className={menuClass}
          items={menuItems}
        />
      </Header>

      <Content className="mx-auto w-full px-4 py-[18px] pb-7 max-sm:px-3 max-sm:py-3.5">
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="-mb-2 flex flex-wrap gap-4 border-b border-neutral-100 pb-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ thanh toán" },
              { key: "shipping", label: "Vận chuyển" },
              { key: "waiting", label: "Chờ giao hàng" },
              { key: "completed", label: "Hoàn thành" },
              { key: "cancelled", label: "Đã hủy" },
              { key: "refund", label: "Trả hàng/Hoàn tiền" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  "cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-4 py-2.5 text-[13px] text-black/75 hover:text-[#ee4d2d] " +
                  (activeTab === tab.key
                    ? "border-b-[#ee4d2d] font-medium text-[#ee4d2d]"
                    : "")
                }
                onClick={() =>
                  setActiveTab(
                    tab.key as
                      | "all"
                      | "pending"
                      | "shipping"
                      | "waiting"
                      | "completed"
                      | "cancelled"
                      | "refund",
                  )
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-2.5">
            <input
              className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-xs focus:border-[#ee4d2d] focus:outline-none"
              placeholder={t("profile.historyOrdersSearchPlaceholder")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-1 mt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Title level={3} className="!m-0">
              Ordered Products
            </Title>

            <Space>
              <Button onClick={() => navigate("/products")}>
                Back to Products
              </Button>
              <Button onClick={() => navigate("/carts")}>Go to Cart</Button>
            </Space>
          </div>
        </div>

        <div className="my-3">
          {created ? (
            <Card
              size="small"
              className="rounded-[14px] border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.04)] [&_.ant-card-body]:p-3.5"
            >
              <Space direction="vertical" size={4} className="w-full">
                <Text>
                  <b>Order:</b>{" "}
                  {(() => {
                    const cr = created as Record<string, unknown>;
                    const ord = cr?.order as Record<string, unknown> | undefined;
                    return String(
                      ord?.order_ID ?? cr?.orderId ?? cr?.id ?? "N/A",
                    );
                  })()}
                </Text>
                <Text>
                  <b>Status:</b>{" "}
                  {(() => {
                    const cr = created as Record<string, unknown>;
                    const ord = cr?.order as Record<string, unknown> | undefined;
                    return String(ord?.status ?? cr?.status ?? "Paid");
                  })()}
                </Text>
                <Text>
                  <b>Payment:</b>{" "}
                  {String((orderData as AnyObj)?.payment || "PayPal")}
                </Text>
                {(() => {
                  const cap = (orderData as AnyObj)?.captureResult as
                    | { id?: unknown }
                    | undefined;
                  return cap?.id != null ? (
                    <Text>
                      <b>PayPal Capture ID:</b> {String(cap.id)}
                    </Text>
                  ) : null;
                })()}
              </Space>
            </Card>
          ) : (
            <Alert
              type="info"
              showIcon
              className="rounded-[14px]"
              message="Tip: Nếu bạn refresh (F5) mà mất dữ liệu, hãy đảm bảo OrderPage có sessionStorage.setItem('last_order_payload', ...)"
            />
          )}
        </div>

        {!displayedItems?.length ? (
          <Empty
            description="No ordered products found (open this page after payment)"
            className="mt-3 rounded-[14px] border border-black/[0.06] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          />
        ) : (
          <div className="mt-3">
            <div className="overflow-hidden rounded-sm border border-neutral-300 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="font-medium">
                    {String(
                      (orderData as { shopName?: string } | null)?.shopName ||
                        "Phan Coffee",
                    )}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                  >
                    Xem shop
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-teal-500">Giao hàng thành công</span>
                  <span className="font-medium text-[#ee4d2d]">
                    HOÀN THÀNH
                  </span>
                </div>
              </div>

              {displayedItems.map((item, idx: number) => (
                <div
                  className="grid grid-cols-1 items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_auto] max-md:justify-items-start"
                  key={idx}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-20 w-20 shrink-0 rounded-sm border border-neutral-100 bg-neutral-100" />
                    <div className="min-w-0">
                      <div className="mb-1 text-[13px] text-black/85">
                        {item?.products?.name || "Sản phẩm"}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Phân loại hàng:{" "}
                        {item?.products?.categoryName || "Coffee"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] text-neutral-600">
                    x{item.quantity}
                  </div>
                  <div className="text-sm text-neutral-900">
                    {Number(item.products?.price || 0).toLocaleString()}
                    ₫
                  </div>
                </div>
              ))}

              <div className="flex flex-col items-end justify-between gap-3 border-t border-neutral-100 px-3 py-2.5 max-md:items-end md:flex-row md:items-center">
                <div className="text-[13px]">
                  <span className="mr-1">Thành tiền:</span>
                  <span className="text-base font-medium text-[#ee4d2d]">
                    {totalVND.toLocaleString()}₫
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="min-w-[120px] cursor-pointer rounded-sm border border-[#ee4d2d] bg-[#fff7f5] px-3 py-1.5 text-[13px] text-[#ee4d2d]"
                  >
                    Mua lại
                  </button>
                  <button
                    type="button"
                    className="min-w-[120px] cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-[13px] text-neutral-600 hover:border-neutral-400"
                  >
                    Liên hệ người bán
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default OrdersPageHistory;
