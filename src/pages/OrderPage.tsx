import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Button, Typography, Alert, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/store/AuthContext';
import { toast } from 'react-toastify';
import type { CartItem } from '@/types';
import Chatbox from '@/components/chatbox';

const { Title, Text } = Typography;

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

declare global {
  interface Window { paypal?: Record<string, unknown>; }
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const OrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartItems: CartItem[] = (location.state as { cartItems?: CartItem[] })?.cartItems || [];

  const [showPaypal, setShowPaypal] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [error, setError] = useState('');

  const paypalRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const savingOnceRef = useRef(false);

  const createOrder = useCreateOrder();

  const totalAmountVND = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity, 0),
    [cartItems],
  );

  const amountUSD = useMemo(() => {
    const usd = totalAmountVND / 24000;
    return usd > 0 ? usd.toFixed(2) : '0.00';
  }, [totalAmountVND]);

  const columns: ColumnsType<CartItem> = [
    { title: 'Sản phẩm', dataIndex: ['products', 'name'], key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: unknown, r: CartItem) => formatPrice(r.products?.price || r.price || 0),
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (_: unknown, r: CartItem) => (
        <Text strong style={{ color: '#6f4e37' }}>
          {formatPrice((r.products?.price || r.price || 0) * r.quantity)}
        </Text>
      ),
    },
  ];

  const getPaypalClientId = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/payment/config`);
    const data = await res.json() as { data?: string };
    if (!data?.data) throw new Error('Missing PAYPAL_CLIENT_ID');
    return String(data.data);
  };

  const loadPaypalScript = async () => {
    try {
      setError('');
      setLoadingSdk(true);
      const clientId = await getPaypalClientId();

      if (window.paypal) { setSdkReady(true); setLoadingSdk(false); return; }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.setAttribute('data-paypal-sdk', '1');
      script.onload = () => { setSdkReady(true); setLoadingSdk(false); };
      script.onerror = () => { setError('Không thể tải PayPal SDK'); setLoadingSdk(false); };
      document.body.appendChild(script);
    } catch (e) {
      setLoadingSdk(false);
      setError((e as Error).message || 'Lỗi tải PayPal');
    }
  };

  const handleConfirmOrder = async () => {
    if (!cartItems.length) { toast.warning('Giỏ hàng trống!'); return; }
    savingOnceRef.current = false;
    renderedRef.current = false;
    setShowPaypal(true);
    setSdkReady(false);
    await loadPaypalScript();
  };

  const handleSaveOrder = async (capture: Record<string, unknown>) => {
    if (savingOnceRef.current) return;
    savingOnceRef.current = true;
    try {
      await createOrder.mutateAsync({
        user_ID: user!.user_ID,
        status: 'Paid',
        paymentMethod: 'PayPal',
        paypalCaptureId: (capture?.id as string) || null,
      });
      toast.success('✅ Thanh toán thành công! Đang chuyển hướng...');
      navigate('/history-orders', {
        state: { orderData: { user_ID: user?.user_ID, totalPriceVND: totalAmountVND, cartItems, captureResult: capture } },
      });
    } catch {
      setError('Lưu đơn hàng thất bại');
      savingOnceRef.current = false;
    }
  };

  useEffect(() => {
    if (!showPaypal || !sdkReady || !window.paypal || !paypalRef.current || renderedRef.current) return;
    paypalRef.current.innerHTML = '';
    renderedRef.current = true;

    (window.paypal as Record<string, (opts: unknown) => { render: (el: HTMLElement) => void }>)
      .Buttons?.({
        style: { layout: 'vertical', label: 'paypal' },
        createOrder: (_d: unknown, actions: { order: { create: (o: unknown) => Promise<string> } }) =>
          actions.order.create({ purchase_units: [{ amount: { currency_code: 'USD', value: amountUSD } }] }),
        onApprove: async (_d: unknown, actions: { order: { capture: () => Promise<Record<string, unknown>> } }) => {
          const capture = await actions.order.capture();
          setShowPaypal(false);
          await handleSaveOrder(capture);
        },
        onError: (err: unknown) => { console.error(err); setError('PayPal lỗi'); renderedRef.current = false; },
      })
      .render(paypalRef.current!);
  }, [showPaypal, sdkReady, amountUSD]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Title level={2} style={{ fontFamily: 'var(--font-display)', color: '#4e3524' }}>
        🧾 Xác nhận đơn hàng
      </Title>

      {cartItems.length === 0 ? (
        <Alert type="warning" message="Không có sản phẩm nào trong đơn hàng" className="mb-4" />
      ) : (
        <Table columns={columns} dataSource={cartItems} rowKey="cartitem_ID" pagination={false} className="mb-6" />
      )}

      <div className="flex justify-end mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">Tổng cộng</span>
            <Title level={4} style={{ margin: 0, color: '#6f4e37' }}>{formatPrice(totalAmountVND)}</Title>
          </div>

          {error && <Alert type="error" showIcon message={error} className="mb-4" />}

          {!showPaypal ? (
            <Button
              type="primary"
              size="large"
              block
              disabled={!cartItems.length}
              style={{ background: '#6f4e37', borderColor: '#6f4e37', height: 48 }}
              onClick={handleConfirmOrder}
            >
              Thanh toán qua PayPal
            </Button>
          ) : (
            <div>
              <Button block className="mb-3" onClick={() => { setShowPaypal(false); setSdkReady(false); renderedRef.current = false; }}>
                ← Quay lại
              </Button>
              {loadingSdk && <div className="text-center py-4"><Spin tip="Đang tải PayPal..." /></div>}
              {createOrder.isPending && <div className="text-center py-2"><Spin tip="Đang lưu đơn hàng..." /></div>}
              <div ref={paypalRef} />
            </div>
          )}
        </div>
      </div>
      <Chatbox />
    </div>
  );
};

export default OrderPage;
