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
import "./index.scss";
import Chatbox from "../../../components/chatbox";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type AnyObj = Record<string, any>;

const LAST_ORDER_KEY = "last_order_payload";

const OrdersPageHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // ✅ 1) Ưu tiên lấy từ navigate state
  const orderDataFromState = (location.state as AnyObj)?.orderData || null;
  const createdFromState = (location.state as AnyObj)?.created || null;

  // ✅ 2) Fallback nếu refresh (state mất): lấy từ sessionStorage
  const fallback = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const orderData = orderDataFromState || fallback?.orderData || null;
  const created = createdFromState || fallback?.created || null;

  const cartItems = orderData?.cartItems || [];

  const displayedItems = useMemo(() => {
    let list = cartItems;

    if (searchText.trim()) {
      const kw = searchText.toLowerCase();
      list = list.filter((item: any) => {
        const name = String(item?.products?.name || "").toLowerCase();
        return name.includes(kw);
      });
    }

    return list;
  }, [cartItems, searchText]);

  const totalVND = useMemo(() => {
    return displayedItems.reduce(
      (sum: number, item: any) =>
        sum + (item.products?.price || 0) * item.quantity,
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
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <ShoppingCartOutlined style={{ fontSize: 20, color: "#000" }} />
        </span>
      ),
    },
  ];

  return (
    <Layout className="orders-page">
      <Header className="homepage__header">
        <div className="homepage__logo">
          <img src={logo} alt="Phan Coffee" />
          <span className="logo-phancoffee">Phan Coffee</span>
        </div>

        <Menu
          mode="horizontal"
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className="menu-home"
          items={menuItems}
        />
      </Header>

      <Content className="orders-content">
        {/* Tabs trạng thái + ô tìm kiếm giống Shopee */}
        <div className="orders-filter-card">
          <div className="orders-tabs">
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
                  "orders-tabs__item" +
                  (activeTab === tab.key ? " orders-tabs__item--active" : "")
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

          <div className="orders-search-row">
            <input
              className="orders-search-input"
              placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Khu vực đơn hàng */}
        <div className="orders-list-wrapper">
          <div className="orders-top-actions">
            <Title level={3} className="orders-top-actions__title">
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

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          {created ? (
            <Card size="small">
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text>
                  <b>Order:</b>{" "}
                  {created?.order?.order_ID ||
                    created?.orderId ||
                    created?.id ||
                    "N/A"}
                </Text>
                <Text>
                  <b>Status:</b>{" "}
                  {created?.order?.status || created?.status || "Paid"}
                </Text>
                <Text>
                  <b>Payment:</b> {orderData?.payment || "PayPal"}
                </Text>
                {orderData?.captureResult?.id && (
                  <Text>
                    <b>PayPal Capture ID:</b> {orderData.captureResult.id}
                  </Text>
                )}
              </Space>
            </Card>
          ) : (
            <Alert
              type="info"
              showIcon
              message="Tip: Nếu bạn refresh (F5) mà mất dữ liệu, hãy đảm bảo OrderPage có sessionStorage.setItem('last_order_payload', ...)"
            />
          )}
        </div>

        {!displayedItems?.length ? (
          <Empty description="No ordered products found (open this page after payment)" />
        ) : (
          <div className="orders-card-list">
            <div className="order-card">
              <div className="order-card__header">
                <div className="order-card__shop">
                  <span className="order-card__shopName">
                    {orderData?.shopName || "Phan Coffee"}
                  </span>
                  <button type="button" className="order-card__shopAction">
                    Chat
                  </button>
                  <button type="button" className="order-card__shopAction">
                    Xem shop
                  </button>
                </div>
                <div className="order-card__status">
                  <span className="order-card__statusShipping">
                    Giao hàng thành công
                  </span>
                  <span className="order-card__statusMain">HOÀN THÀNH</span>
                </div>
              </div>

              {displayedItems.map((item: any, idx: number) => (
                <div className="order-card__body" key={idx}>
                  <div className="order-card__product">
                    <div className="order-card__thumb" />
                    <div className="order-card__info">
                      <div className="order-card__name">
                        {item?.products?.name || "Sản phẩm"}
                      </div>
                      <div className="order-card__meta">
                        Phân loại hàng:{" "}
                        {item?.products?.categoryName || "Coffee"}
                      </div>
                    </div>
                  </div>
                  <div className="order-card__qty">x{item.quantity}</div>
                  <div className="order-card__price">
                    {(item.products?.price || 0).toLocaleString()}₫
                  </div>
                </div>
              ))}

              <div className="order-card__footer">
                <div className="order-card__total">
                  <span>Thành tiền:</span>
                  <span className="order-card__totalValue">
                    {totalVND.toLocaleString()}₫
                  </span>
                </div>
                <div className="order-card__actions">
                  <button
                    type="button"
                    className="order-card__button order-card__button--primary"
                  >
                    Mua lại
                  </button>
                  <button
                    type="button"
                    className="order-card__button order-card__button--secondary"
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
