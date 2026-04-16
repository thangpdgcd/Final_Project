import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Spin, Modal, Form, Input } from 'antd';
import { EnvironmentOutlined, ShopOutlined, MessageOutlined, TagOutlined, CarOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateOrder } from '../hooks/useOrders';
import { useAuth } from '@/store/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { CartItem } from '@/types';
import Chatbox from '@/components/chatbox';
import EditorialPageShell from '@/components/layout/EditorialPageShell';
import { getImageSrc } from '@/utils/image';
import { ordersService } from '../services/orders.service';
import { CART_KEY, syncCartToSelectionForCheckout } from '@/features/cart';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as profileApi from '@/api/profileApi';

const API_BASE = ((import.meta.env.VITE_API_URL as string) || 'http://localhost:8080').replace(/\/+$/, '');
const API_HOST = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
const PAYPAL_CONFIG_PATHS = ['/payment/config', '/paypal/config', '/config/paypal'] as const;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const OrderPage: React.FC = () => {
  useDocumentTitle('pages.orders.documentTitle');

  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const cartItems: CartItem[] = useMemo(
    () => (location.state as { cartItems?: CartItem[] })?.cartItems || [],
    [location.state],
  );

  const [showPaypal, setShowPaypal] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cod' | 'coffee_coin'>('cod');
  const [shippingFee] = useState(17000);
  const [walletCoin, setWalletCoin] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    phone: user?.phoneNumber || '',
    address: user?.address || 'Số 308, Trần Hưng Đạo, Thôn 2, Sa Thầy, Kon Tum',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const paypalRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const savingOnceRef = useRef(false);

  const createOrder = useCreateOrder();

  const productsTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity, 0),
    [cartItems],
  );

  const grandTotal = productsTotal + shippingFee;

  const amountUSD = useMemo(() => {
    const usd = grandTotal / 24000;
    return usd > 0 ? usd.toFixed(2) : '0.00';
  }, [grandTotal]);

  const fetchWalletCoin = async () => {
    if (!user?.user_ID) return;
    try {
      setWalletLoading(true);
      const payload = await profileApi.getWallet();
      const walletValue = Number(
        (payload as any)?.walletCoin ??
          (payload as any)?.walletXu ??
          (payload as any)?.data?.walletCoin ??
          (payload as any)?.data?.walletXu ??
          0,
      );
      setWalletCoin(Number.isFinite(walletValue) ? walletValue : 0);
    } catch {
      setWalletCoin(null);
    } finally {
      setWalletLoading(false);
    }
  };

  const getPaypalClientId = async (): Promise<string> => {
    const envClientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined)?.trim();
    if (envClientId) return envClientId;

    const candidateUrls = [
      ...new Set([
        ...PAYPAL_CONFIG_PATHS.map((path) => `${API_HOST}${path}`),
        ...PAYPAL_CONFIG_PATHS.map((path) => `${API_BASE}${path}`),
      ]),
    ];

    let lastMessage = '';
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          lastMessage = `${res.status} ${res.statusText}`.trim();
          continue;
        }

        const data = (await res.json()) as {
          data?: string | { clientId?: string; clientID?: string };
          clientId?: string;
          clientID?: string;
        };

        const clientId =
          typeof data?.data === 'string'
            ? data.data
            : data?.data?.clientId ?? data?.data?.clientID ?? data?.clientId ?? data?.clientID;

        if (clientId) return String(clientId);
      } catch (error) {
        lastMessage = (error as Error)?.message || 'Unknown error';
      }
    }

    throw new Error(lastMessage ? `Missing PAYPAL_CLIENT_ID (${lastMessage})` : 'Missing PAYPAL_CLIENT_ID');
  };

  const loadPaypalScript = async () => {
    try {
      setLoadingSdk(true);
      const clientId = await getPaypalClientId();
      if ((window as any).paypal) {
        setSdkReady(true);
        setLoadingSdk(false);
        return;
      }
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.setAttribute('data-paypal-sdk', '1');
      script.onload = () => {
        setSdkReady(true);
        setLoadingSdk(false);
      };
      script.onerror = () => {
        setError('Không thể tải PayPal SDK');
        setLoadingSdk(false);
      };
      document.body.appendChild(script);
    } catch (e) {
      setLoadingSdk(false);
      setError((e as Error).message || 'Lỗi tải PayPal');
    }
  };

  const handleSaveOrder = async (opts: { method: 'paypal' | 'cod' | 'coffee_coin'; captureId?: string }) => {
    if (savingOnceRef.current) return;
    savingOnceRef.current = true;
    try {
      const fallbackUserId = Number(
        user?.user_ID ?? (typeof window !== 'undefined' ? localStorage.getItem('user_ID') : null),
      );
      const userIdToUse = Number.isFinite(fallbackUserId) ? fallbackUserId : (user?.user_ID as any);
      if (!userIdToUse) throw new Error('MISSING_USER_ID');

      await syncCartToSelectionForCheckout(userIdToUse, cartItems);

      const newOrder = await createOrder.mutateAsync({
        user_ID: userIdToUse,
        status: opts.method === 'paypal' ? 'Paid' : 'pending',
        total_Amount: grandTotal,
        shipping_Address: `${shipping.fullName} | ${shipping.phone} | ${shipping.address}`,
        paymentMethod: opts.method === 'coffee_coin' ? 'COFFEE_COIN' : opts.method === 'paypal' ? 'PayPal' : 'COD',
        paypalCaptureId: opts.method === 'paypal' ? opts.captureId : undefined,
      });

      const createdOrderId = Number(
        (newOrder as any)?.order_ID ??
          (newOrder as any)?.orderId ??
          (newOrder as any)?.id ??
          (newOrder as any)?.data?.order_ID ??
          (newOrder as any)?.data?.orderId ??
          (newOrder as any)?.data?.id,
      );
      if (!Number.isFinite(createdOrderId) || createdOrderId <= 0) {
        throw new Error('INVALID_ORDER_ID');
      }

      const shipLine = `${shipping.fullName} | ${shipping.phone} | ${shipping.address}`;
      const payNote =
        opts.method === 'paypal'
          ? `PayPal | capture: ${String(opts.captureId ?? '')}`
          : opts.method === 'coffee_coin'
            ? 'Coffee Coin'
            : 'COD';
      try {
        await ordersService.update(createdOrderId, {
          shipping_Address: `${shipLine} | ${payNote}`,
        });
      } catch (e) {
        console.warn('Could not persist shipping note on order:', e);
      }

      const uid = Number(user?.user_ID ?? (typeof window !== 'undefined' ? localStorage.getItem('user_ID') : null));
      if (Number.isFinite(uid) && uid > 0) {
        await qc.invalidateQueries({ queryKey: CART_KEY });
      }
      if (opts.method === 'coffee_coin') {
        await fetchWalletCoin();
      }

      toast.success('✅ Order created successfully!');
      navigate('/profile?tab=orders&status=Pending');
    } catch (err) {
      console.error('Save order failed:', err);
      const serverMsg = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message ??
          (err.response?.data as any)?.error ??
          (typeof err.response?.data === 'string' ? err.response?.data : null)
        : null;

      setError(serverMsg ? `Save order failed: ${serverMsg}` : 'Save order failed');
      savingOnceRef.current = false;
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'paypal') {
      setShowPaypal(true);
      if (!sdkReady) await loadPaypalScript();
    } else if (paymentMethod === 'coffee_coin') {
      await handleSaveOrder({ method: 'coffee_coin' });
    } else {
      await handleSaveOrder({ method: 'cod' });
    }
  };

  useEffect(() => {
    const w = window as any;
    if (!showPaypal || !sdkReady || !w.paypal || !paypalRef.current || renderedRef.current) return;
    paypalRef.current.innerHTML = '';
    renderedRef.current = true;
    w.paypal
      .Buttons?.({
        style: { layout: 'vertical', label: 'paypal' },
        createOrder: (_d: any, actions: any) =>
          actions.order.create({ purchase_units: [{ amount: { currency_code: 'USD', value: amountUSD } }] }),
        onApprove: async (_d: any, actions: any) => {
          const capture = await actions.order.capture();
          const captureId = String((capture as any)?.id ?? '');
          setShowPaypal(false);
          await handleSaveOrder({ method: 'paypal', captureId });
        },
        onError: (err: any) => {
          console.error(err);
          setError('PayPal lỗi');
          renderedRef.current = false;
        },
      })
      .render(paypalRef.current!);
  }, [showPaypal, sdkReady, amountUSD]);

  useEffect(() => {
    if (!cartItems.length) {
      const timer = setTimeout(() => navigate('/cart'), 2000);
      return () => clearTimeout(timer);
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (paymentMethod === 'coffee_coin') {
      void fetchWalletCoin();
    }
  }, [paymentMethod, user?.user_ID]);

  if (!cartItems.length) {
    return (
      <EditorialPageShell innerClassName="flex min-h-[40vh] flex-col items-center justify-center px-5 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <Spin size="large" />
          <span className="text-sm text-stone-500">Redirecting to cart...</span>
        </div>
      </EditorialPageShell>
    );
  }

  return (
    <EditorialPageShell innerClassName="pb-20">
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-sm p-6">
          <div className="flex items-center gap-2 text-orange-600 mb-4">
            <EnvironmentOutlined className="text-xl" />
            <span className="text-lg font-medium">Địa Chỉ Nhận Hàng</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide min-w-[200px]">
              {shipping.fullName} ({shipping.phone})
            </div>
            <div className="flex-1 text-stone-700 dark:text-stone-300">
              {shipping.address}
              <span className="ml-4 text-[10px] border border-orange-600 text-orange-600 px-1 py-0.5 rounded">Mặc định</span>
            </div>
            <button
              onClick={() => {
                form.setFieldsValue(shipping);
                setIsModalOpen(true);
              }}
              className="text-blue-500 text-sm font-medium hover:underline"
            >
              Thay Đổi
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 dark:border-stone-800 grid grid-cols-12 text-sm text-stone-500 font-medium">
            <div className="col-span-12 md:col-span-6 font-bold text-stone-900 dark:text-stone-100 text-lg">Sản phẩm</div>
            <div className="hidden md:block col-span-2 text-center">Đơn giá</div>
            <div className="hidden md:block col-span-2 text-center">Số lượng</div>
            <div className="hidden md:block col-span-2 text-right">Thành tiền</div>
          </div>

          <div className="px-6 py-3 border-b border-stone-50 dark:border-stone-800 flex items-center gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Yêu thích</span>
            <span className="text-sm font-bold flex items-center gap-1">
              Phan Coffee Official <ShopOutlined />
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1 ml-4 border-l border-stone-200 dark:border-stone-800 pl-4">
              <MessageOutlined /> Chat ngay
            </span>
          </div>

          {cartItems.map((item) => (
            <div key={item.cartitem_ID} className="px-6 py-6 border-b last:border-0 border-stone-50 dark:border-stone-800 grid grid-cols-12 items-center gap-4">
              <div className="col-span-12 md:col-span-6 flex gap-4">
                <img src={getImageSrc(item.products?.image)} alt="" className="w-12 h-12 rounded object-cover border border-stone-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-stone-900 dark:text-stone-100 line-clamp-1">{item.products?.name}</h4>
                  <div className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">Phân loại: Default</div>
                </div>
              </div>
              <div className="col-span-4 md:col-span-2 text-center text-sm">{formatPrice(item.products?.price || item.price || 0)}</div>
              <div className="col-span-4 md:col-span-2 text-center text-sm">{item.quantity}</div>
              <div className="col-span-4 md:col-span-2 text-right text-sm font-medium">
                {formatPrice((item.products?.price || item.price || 0) * item.quantity)}
              </div>
            </div>
          ))}

          <div className="bg-blue-50/20 dark:bg-blue-900/5 px-6 py-6 border-t border-dashed border-stone-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4 max-w-md">
                <span className="text-sm whitespace-nowrap min-w-[60px]">Lời nhắn:</span>
                <input className="flex-1 bg-white dark:bg-[#222] border border-stone-200 dark:border-stone-800 px-3 py-2 rounded text-sm outline-none placeholder:text-stone-400" placeholder="Lưu ý cho Người bán..." />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TagOutlined className="text-orange-600" />
                <span>Voucher của Shop</span>
                <button className="text-blue-500 hover:underline ml-auto">Chọn Voucher</button>
              </div>
            </div>
            <div className="border-l border-dashed border-stone-100 dark:border-stone-800 pl-0 md:pl-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CarOutlined className="text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium text-green-600">Đơn vị vận chuyển: Vận Chuyển Nhanh</div>
                    <div className="text-[10px] text-stone-400">Nhận hàng vào 29 Th03 - 3 Th04</div>
                    <div className="text-[10px] text-stone-400">
                      Được đồng kiểm <EnvironmentOutlined className="text-[8px]" />
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <button className="text-blue-500 hover:underline mr-4">Thay Đổi</button>
                  <span className="font-medium">{formatPrice(shippingFee)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-stone-50 dark:border-stone-800 bg-[#fafdff] dark:bg-[#1a1c1d] flex justify-end items-center gap-4">
            <span className="text-sm text-stone-500">Tổng số tiền ({cartItems.length} sản phẩm):</span>
            <span className="text-xl font-bold text-orange-600">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-sm">
          <div className="px-6 py-4 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
            <span className="text-lg font-medium">Phương thức thanh toán</span>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`px-4 py-2 border rounded-sm text-sm transition-all ${
                  paymentMethod === 'cod' ? 'border-orange-600 text-orange-600' : 'border-stone-200 dark:border-stone-800 hover:border-orange-600'
                }`}
              >
                Thanh toán khi nhận hàng
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`px-4 py-2 border rounded-sm text-sm transition-all ${
                  paymentMethod === 'paypal' ? 'border-orange-600 text-orange-600' : 'border-stone-200 dark:border-stone-800 hover:border-orange-600'
                }`}
              >
                PayPal
              </button>
              <button
                onClick={() => setPaymentMethod('coffee_coin')}
                className={`px-4 py-2 border rounded-sm text-sm transition-all ${
                  paymentMethod === 'coffee_coin'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-stone-200 dark:border-stone-800 hover:border-orange-600'
                }`}
              >
                Coffee Coin
              </button>
            </div>
          </div>

          {paymentMethod === 'coffee_coin' && (
            <div className="px-6 py-3 border-b border-stone-50 dark:border-stone-800 text-sm">
              <span className="text-stone-500">Số dư Coffee Coin: </span>
              <span className="font-semibold text-orange-600">
                {walletLoading
                  ? 'Đang tải...'
                  : `${Number(walletCoin ?? 0).toLocaleString('vi-VN')} Coin`}
              </span>
              {!walletLoading && walletCoin != null && walletCoin < grandTotal && (
                <span className="ml-3 text-red-500">
                  Số dư không đủ để thanh toán đơn này.
                </span>
              )}
            </div>
          )}

          <div className="p-10 flex flex-col items-end space-y-3 bg-[#fffefb] dark:bg-[#1a1a1a]">
            <div className="grid grid-cols-2 gap-x-20 gap-y-3 text-sm text-stone-500 text-right min-w-[300px]">
              <span>Tổng tiền hàng</span>
              <span className="text-stone-900 dark:text-stone-100">{formatPrice(productsTotal)}</span>
              <span>Phí vận chuyển</span>
              <span className="text-stone-900 dark:text-stone-100">{formatPrice(shippingFee)}</span>
              <span className="text-lg mt-2 font-medium">Tổng thanh toán:</span>
              <span className="text-3xl font-bold text-orange-600 mt-2">{formatPrice(grandTotal)}</span>
            </div>

            {error && <Alert type="error" showIcon message={error} className="w-full max-w-md mt-4" />}

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 w-full flex flex-col items-end">
              <p className="text-xs text-stone-400 mb-6">Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo Điều khoản Phan Coffee</p>
              {!showPaypal ? (
                <Button
                  type="primary"
                  className="bg-orange-600 hover:bg-orange-700 border-none h-12 px-14 font-bold text-lg rounded-sm"
                  loading={createOrder.isPending}
                  disabled={
                    paymentMethod === 'coffee_coin' &&
                    !walletLoading &&
                    walletCoin != null &&
                    walletCoin < grandTotal
                  }
                  onClick={handlePlaceOrder}
                >
                  Đặt hàng
                </Button>
              ) : (
                <div className="w-full max-w-sm">
                  {loadingSdk && (
                    <div className="text-center py-4">
                      <div className="inline-flex flex-col items-center gap-2">
                        <Spin />
                        <span className="text-xs text-stone-500">Đang tải PayPal...</span>
                      </div>
                    </div>
                  )}
                  <div ref={paypalRef} />
                  <Button block className="mt-2" onClick={() => setShowPaypal(false)}>
                    Quay lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Chatbox />

      <Modal
        title="Thay Đổi Địa Chỉ Nhận Hàng"
        open={isModalOpen}
        onOk={() => {
          form.validateFields().then((values) => {
            setShipping(values);
            setIsModalOpen(false);
          });
        }}
        onCancel={() => setIsModalOpen(false)}
        okText="Hoàn thành"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-orange-600 hover:bg-orange-700' }}
      >
        <Form form={form} layout="vertical" initialValues={shipping} className="pt-4">
          <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="address" label="Địa Chỉ Chi Tiết" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ nhận hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </EditorialPageShell>
  );
};

export default OrderPage;

