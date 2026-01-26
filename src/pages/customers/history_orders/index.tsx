import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Table,
  Typography,
  Button,
  Alert,
  Empty,
  Card,
  Space,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";

import FooterPage from "../../../components/footer";
import "./index.scss";
import Chatbox from "../../../components/chatbox";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type AnyObj = Record<string, any>;

const LAST_ORDER_KEY = "last_order_payload";

const OrdersPageHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const columns = [
    { title: "Product", dataIndex: ["products", "name"], key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Unit Price",
      dataIndex: ["products", "price"],
      key: "price",
      render: (price: number) => `${(price || 0).toLocaleString()}₫`,
    },
    {
      title: "Subtotal",
      key: "total",
      render: (_: any, record: any) =>
        `${(
          (record.products?.price || 0) * record.quantity || 0
        ).toLocaleString()}₫`,
    },
  ];

  const totalVND = useMemo(() => {
    return cartItems.reduce(
      (sum: number, item: any) =>
        sum + (item.products?.price || 0) * item.quantity,
      0,
    );
  }, [cartItems]);

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
    <Layout className='orders-page'>
      <Header className='homepage__header'>
        <div className='homepage__logo'>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          items={menuItems}
        />
      </Header>

      <Content className='orders-content' style={{ padding: 24 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Ordered Products
          </Title>

          <Space>
            <Button onClick={() => navigate("/products")}>
              Back to Products
            </Button>
            <Button onClick={() => navigate("/carts")}>Go to Cart</Button>
          </Space>
        </div>

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          {created ? (
            <Card size='small'>
              <Space direction='vertical' size={4} style={{ width: "100%" }}>
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
              type='info'
              showIcon
              message="Tip: Nếu bạn refresh (F5) mà mất dữ liệu, hãy đảm bảo OrderPage có sessionStorage.setItem('last_order_payload', ...)"
            />
          )}
        </div>

        {!cartItems?.length ? (
          <Empty description='No ordered products found (open this page after payment)' />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={cartItems}
              rowKey={(r: any) =>
                String(r?.cartitem_ID || r?.id || Math.random())
              }
              pagination={false}
            />
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                Total: {totalVND.toLocaleString()}₫
              </Title>
              {orderData?.totalPriceUSD && (
                <Text type='secondary'>≈ {orderData.totalPriceUSD} USD</Text>
              )}
            </div>
          </>
        )}
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default OrdersPageHistory;
