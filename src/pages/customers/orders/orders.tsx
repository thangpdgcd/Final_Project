import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Button, Typography, App, Alert, Spin } from "antd";
import { ShoppingCartOutlined, LeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../services/axios";
import { CART_KEY } from "../../../hooks/useCart";

import FooterPage from "../../../components/layout/Footer";
import HeaderPage from "../../../components/layout/Header";
import Chatbox from "../../../components/chatbox";

const { Title } = Typography;

const API_URL = ((import.meta.env.VITE_API_URL as string) || "http://localhost:8080").replace(
  /\/$/,
  "",
);

const CONFIG_ENDPOINT = "/payment/config";
const CREATE_ORDER_DB_ENDPOINT = "/create-orders";

const ORDERS_HISTORY_ROUTE = "/history-orders";

const LAST_ORDER_KEY = "last_order_payload";

declare global {
  interface Window {
    paypal?: any;
  }
}

const OrderPage: React.FC = () => {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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
    {
      title: t("order.product", "Product"),
      dataIndex: ["products", "name"],
      key: "name",
      render: (name: string, record: any) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-black/5 bg-white flex-shrink-0">
            <img
              src={record.products?.imageUrl || "/placeholder-coffee.png"}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder-coffee.png")}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-coffee-900 dark:text-coffee-100">{name}</span>
            <span className="text-xs text-coffee-600/70 dark:text-coffee-400/70">
              Qty: {record.quantity}
            </span>
          </div>
        </div>
      )
    },
    {
      title: t("order.unitPrice", "Unit Price"),
      dataIndex: ["products", "price"],
      key: "price",
      responsive: ["md"] as any,
      render: (price: number) => (
        <span className="text-coffee-700 dark:text-coffee-200">
          ${(price || 0).toLocaleString()}₫
        </span>
      ),
    },
    {
      title: t("order.subtotal", "Subtotal"),
      key: "total",
      align: "right" as any,
      render: (_: any, record: any) => (
        <span className="font-bold text-coffee-900 dark:text-coffee-100">
          {((record.products?.price || 0) * record.quantity || 0).toLocaleString()}₫
        </span>
      ),
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

  const getUserId = () => {
    return (
      localStorage.getItem("user_ID") || localStorage.getItem("userId") || ""
    );
  };

  const getConfig = async (): Promise<string> => {
    const res = await fetch(`${API_URL}${CONFIG_ENDPOINT}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to load PayPal config");
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
    if (!cartItems?.length) {
      message.error(t("payment.cartEmpty"));
      return;
    }

    savingOnceRef.current = false;
    renderedRef.current = false;

    setShowPaypal(true);
    setSdkReady(false);
    setError("");

    await addPaypalScript();
  };

  const handleSaveOrderToDBAndGoOrdersHistory = async (capture: any) => {
    if (savingOnceRef.current) return;
    savingOnceRef.current = true;

    try {
      setSavingOrder(true);
      setError("");

      const user_ID = getUserId();
      if (!user_ID) throw new Error("Missing user_ID (please login first)");

      const res = await axiosInstance.post(CREATE_ORDER_DB_ENDPOINT, {
        user_ID: Number(user_ID),
        status: "Paid",
        paymentMethod: "PayPal",
        paypalCaptureId: capture?.id || null,
      });
      const data = res.data;

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

      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(payload));

      queryClient.setQueryData([...CART_KEY, Number(user_ID)], []);
      await queryClient.invalidateQueries({ queryKey: CART_KEY });

      message.success(t("payment.orderPaymentSuccess"));

      navigate(ORDERS_HISTORY_ROUTE, { state: payload });
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save order",
      );
      savingOnceRef.current = false;
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
        style: { layout: "vertical", label: "paypal", shape: "pill" },

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
    <div className='min-h-screen bg-[#e7d6c0] dark:bg-[#1b120d] transition-colors duration-300'>
      <HeaderPage />

      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
             <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate(-1)}
              className="text-coffee-600 dark:text-coffee-400 hover:text-coffee-900"
            >
              {t("common.back", "Back")}
            </Button>
          </div>
          <Title level={2} className="!m-0 !text-coffee-900 dark:!text-coffee-100 flex items-center gap-3">
            <span className="bg-coffee-900 text-white rounded-lg p-2 dark:bg-coffee-100 dark:text-coffee-900">
                <ShoppingCartOutlined />
            </span>
            {t("order.confirmation", "Order Confirmation")}
          </Title>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
               <Table
                columns={columns}
                dataSource={cartItems}
                rowKey='cartitem_ID'
                pagination={false}
                className="custom-order-table"
                locale={{ emptyText: t("payment.cartEmpty", "Your cart is empty") }}
              />
            </div>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-white dark:bg-[#2a1b15] rounded-3xl p-8 shadow-2xl border border-black/5 dark:border-white/5">
              <Title level={4} className="!mb-6 !text-coffee-900 dark:!text-coffee-100">
                {t("order.summary", "Order Summary")}
              </Title>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-coffee-600 dark:text-coffee-400">
                  <span>{t("order.subtotal", "Subtotal")}</span>
                  <span className="font-medium text-coffee-900 dark:text-coffee-100">
                    {totalAmountVND.toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-coffee-600 dark:text-coffee-400">
                    <span>{t("order.shipping", "Shipping")}</span>
                    <span className="text-green-500 font-medium">{t("order.free", "Free")}</span>
                </div>
                <div className="h-px bg-black/5 dark:bg-white/5 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-coffee-900 dark:text-coffee-100">
                    {t("order.total", "Total")}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-coffee-900 dark:text-coffee-100">
                        {totalAmountVND.toLocaleString()}₫
                    </div>
                    <div className="text-xs text-coffee-500 font-medium">
                        ≈ ${amountUSD} USD
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <Alert
                    type='error'
                    showIcon
                    message={error}
                    className="rounded-xl border-red-200 bg-red-50 text-red-800"
                  />
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {!showPaypal ? (
                  <motion.div
                    key="confirm-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                     <Button
                        type='primary'
                        size='large'
                        block
                        disabled={!cartItems?.length || savingOrder}
                        loading={savingOrder}
                        onClick={handleConfirmOrder}
                        className="h-14 !rounded-2xl !bg-coffee-900 dark:!bg-coffee-100 dark:!text-coffee-900 !border-none !text-lg !font-bold hover:!scale-[1.02] active:!scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {t("order.confirmOrder", "Confirm Order")}
                        <ArrowRightOutlined />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="paypal-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                        {(loadingSdk || savingOrder) && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl">
                                <Spin tip={loadingSdk ? "Loading PayPal..." : "Saving order..."} />
                            </div>
                        )}
                        <div ref={paypalRef} className="min-h-[150px]" />
                    </div>

                    <Button
                        block
                        onClick={handleBack}
                        disabled={savingOrder}
                        className="h-12 !rounded-xl border-black/10 dark:border-white/10 hover:!border-coffee-900 dark:hover:!border-coffee-100 !text-coffee-600 dark:!text-coffee-400 font-medium"
                    >
                        {t("common.back", "Cancel & Go Back")}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterPage />
      <Chatbox />

      <style>{`
        .custom-order-table .ant-table {
          background: transparent !important;
        }
        .custom-order-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 2px solid rgba(0,0,0,0.05) !important;
          color: rgba(0,0,0,0.45) !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .dark .custom-order-table .ant-table-thead > tr > th {
          border-bottom-color: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.45) !important;
        }
        .custom-order-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(0,0,0,0.03) !important;
          padding: 16px 8px !important;
        }
        .dark .custom-order-table .ant-table-tbody > tr > td {
          border-bottom-color: rgba(255,255,255,0.05) !important;
        }
        .custom-order-table .ant-table-tbody > tr:hover > td {
          background: rgba(0,0,0,0.02) !important;
        }
        .dark .custom-order-table .ant-table-tbody > tr:hover > td {
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default OrderPage;
