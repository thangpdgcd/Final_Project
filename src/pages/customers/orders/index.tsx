import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Table, Button, Typography, message, Alert, Spin } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

import FooterPage from "../../../components/footer";
import "./index.scss";
import HeaderPage from "../../../components/header";
import Chatbox from "../../../components/chatbox";

const { Content } = Layout;
const { Title } = Typography;

const API_BASE = "http://localhost:8080"; // ✅ bỏ "/" cuối

const CONFIG_ENDPOINT = "/payment/config";
const CREATE_ORDER_DB_ENDPOINT = "/api/create-orders";

const ORDERS_HISTORY_ROUTE = "/history-orders";

const LAST_ORDER_KEY = "last_order_payload";

declare global {
  interface Window {
    paypal?: any;
  }
}

const OrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];

  const [showPaypal, setShowPaypal] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(false);

  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");

  const paypalRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const savingOnceRef = useRef(false);

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

  const totalAmountVND = useMemo(() => {
    return cartItems.reduce(
      (sum: number, item: any) =>
        sum + (item.products?.price || 0) * item.quantity,
      0,
    );
  }, [cartItems]);

  const amountUSD = useMemo(() => {
    const usd = totalAmountVND / 24000;
    return usd > 0 ? usd.toFixed(2) : "0.00";
  }, [totalAmountVND]);

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    about: "/about",
    login: "/login",
    carts: "/carts",
    orders: ORDERS_HISTORY_ROUTE,
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

  const getUserId = () => {
    return (
      localStorage.getItem("user_ID") || localStorage.getItem("userId") || ""
    );
  };

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return { ok: res.ok, data: JSON.parse(text) };
    } catch {
      return { ok: false, data: { message: text || "Response is not JSON" } };
    }
  };

  const getConfig = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}${CONFIG_ENDPOINT}`);
    const { ok, data } = await safeJson(res);

    if (!ok) throw new Error(data?.message || "Failed to load PayPal config");

    const clientId = String(data?.data || "").trim();
    if (!clientId) throw new Error("Missing PAYPAL_CLIENT_ID in .env");

    return clientId;
  };

  const addPaypalScript = async () => {
    try {
      setError("");
      setLoadingSdk(true);

      const clientId = await getConfig();

      if (window.paypal) {
        setSdkReady(true);
        setLoadingSdk(false);
        return;
      }

      const existed = document.querySelector(`script[data-paypal-sdk="1"]`);
      if (existed) {
        setSdkReady(true);
        setLoadingSdk(false);
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId,
      )}&currency=USD&intent=capture`;
      script.setAttribute("data-paypal-sdk", "1");

      script.onload = () => {
        setSdkReady(true);
        setLoadingSdk(false);
      };

      script.onerror = () => {
        setError("Failed to load PayPal SDK (clientId/adblock/network issue)");
        setLoadingSdk(false);
      };

      document.body.appendChild(script);
    } catch (e: any) {
      setLoadingSdk(false);
      setError(e?.message || "Failed to load PayPal");
    }
  };

  const handleConfirmOrder = async () => {
    ///check
    if (!cartItems?.length) {
      message.error("Cart is empty!");
      return;
    }

    // reset flags
    savingOnceRef.current = false;
    renderedRef.current = false;

    setShowPaypal(true);
    setSdkReady(false);
    setError("");

    await addPaypalScript();
  };

  // ✅ Save DB + lưu sessionStorage + redirect sang OrdersPageHistory
  const handleSaveOrderToDBAndGoOrdersHistory = async (capture: any) => {
    if (savingOnceRef.current) return; // chống double-call
    savingOnceRef.current = true;

    try {
      setSavingOrder(true);
      setError("");

      const user_ID = getUserId();
      if (!user_ID) throw new Error("Missing user_ID (please login first)");

      const res = await fetch(`${API_BASE}${CREATE_ORDER_DB_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ID: Number(user_ID),
          status: "Paid",
          paymentMethod: "PayPal",
          paypalCaptureId: capture?.id || null,
        }),
      });

      const { ok, data } = await safeJson(res);
      if (!ok) throw new Error(data?.message || "Failed to create order");

      const payload = {
        orderData: {
          user_ID,
          payment: "PayPal",
          totalPriceVND: totalAmountVND,
          totalPriceUSD: amountUSD,
          cartItems,
          captureResult: capture,
        },
        created: data,
      };

      // ✅ refresh (F5) vẫn còn data
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(payload));

      message.success(
        "Payment success ✅ Redirecting to your ordered products...",
      );

      // ✅ redirect đến đúng trang bạn đưa (OrdersPageHistory)
      navigate(ORDERS_HISTORY_ROUTE, { state: payload });
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to save order");
      savingOnceRef.current = false; // cho phép thử lại nếu fail
    } finally {
      setSavingOrder(false);
    }
  };

  useEffect(() => {
    if (!showPaypal) return;
    if (!sdkReady) return;
    if (!window.paypal) return;
    if (!paypalRef.current) return;
    if (renderedRef.current) return;

    paypalRef.current.innerHTML = "";
    renderedRef.current = true;

    window.paypal
      .Buttons({
        style: { layout: "vertical", label: "paypal" },

        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amountUSD,
                },
              },
            ],
          });
        },

        // ✅ Pay xong → capture → auto save DB → auto redirect OrdersPageHistory
        onApprove: async (_data: any, actions: any) => {
          try {
            const capture = await actions.order.capture();
            setShowPaypal(false);
            await handleSaveOrderToDBAndGoOrdersHistory(capture);
          } catch (e: any) {
            console.error(e);
            setError(e?.message || "Capture failed");
            renderedRef.current = false;
          }
        },

        onError: (err: any) => {
          console.error("PayPal error:", err);
          setError("PayPal error");
          renderedRef.current = false;
        },
      })
      .render(paypalRef.current);
  }, [showPaypal, sdkReady, amountUSD]);

  const handleBack = () => {
    setShowPaypal(false);
    setSdkReady(false);
    setLoadingSdk(false);
    setSavingOrder(false);
    setError("");
    renderedRef.current = false;
    savingOnceRef.current = false;
    if (paypalRef.current) paypalRef.current.innerHTML = "";
  };

  return (
    <Layout className='order-page'>
      <HeaderPage />

      <Content className='order-content' style={{ padding: 24 }}>
        <Title level={3}>Order Confirmation</Title>

        <Table
          columns={columns}
          dataSource={cartItems}
          rowKey='cartitem_ID'
          pagination={false}
        />

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Title level={4}>Total: {totalAmountVND.toLocaleString()}₫</Title>

          {error && (
            <div style={{ marginBottom: 12 }}>
              <Alert type='error' showIcon message={error} />
            </div>
          )}

          {!showPaypal && (
            <Button
              type='primary'
              size='large'
              disabled={!cartItems?.length || savingOrder}
              loading={savingOrder}
              onClick={handleConfirmOrder}>
              Confirm Order
            </Button>
          )}

          {showPaypal && (
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button onClick={handleBack} disabled={savingOrder}>
                Back
              </Button>

              <div style={{ minWidth: 260 }}>
                {loadingSdk && <Spin tip='Loading PayPal...' />}
                {savingOrder && <Spin tip='Saving order...' />}
                <div ref={paypalRef} />
              </div>
            </div>
          )}
        </div>
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default OrderPage;
