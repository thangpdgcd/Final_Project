import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Spin, Modal, Form, Input } from 'antd';
import {
  EnvironmentOutlined,
  ShopOutlined,
  MessageOutlined,
  TagOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/auth/AuthContext';
import axios from 'axios';
import type { CartItem } from '@/types/index';
import Chatbox from '@/types/widgets/chatbox';
import EditorialPageShell from '@/components/layout/editorialpageshells/EditorialPageShell';
import { getImageSrc } from '@/utils/images/image';
import { CART_KEY } from '@/hooks/cart/useCart';
import { syncCartToSelectionForCheckout } from '@/services/cart/cart.service';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import * as profileApi from '@/api/profilesapi/profileApi';
import VoucherInput from '@/components/voucher/VoucherInput';
import VoucherSummary from '@/components/voucher/VoucherSummary';
import { useApplyVoucher } from '@/hooks/voucher/useApplyVoucher';
import { useEffectiveUserId } from '@/hooks/usereffectiveuserids/useEffectiveUserId';
import { useAppTranslation } from '@/hooks/userapptranslations/useAppTranslation';
import { translatedProductName } from '@/utils/products/productI18n';
import { i18nKeys } from '@/translates/constants/i18nKeys';
import { toastSuccess, toastErrorWithFallback } from '@/utils/lib/toast/i18nToast';
import { calcShippingFeeVnd } from '@/utils/shippings/shippingFee';
import { useShipping } from '@/components/contexts/shippingcontexts/ShippingContext';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createOrderThunk } from '@/redux/slices/ordersSlice';
import { selectIsCreatingOrder } from '@/redux/selectors';

const API_BASE = ((import.meta.env.VITE_API_URL as string) || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);
const API_HOST = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
const PAYPAL_CONFIG_PATHS = ['/payment/config', '/paypal/config', '/config/paypal'] as const;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

const OrderPage: React.FC = () => {
  useDocumentTitle('pages.orders.documentTitle');
  const { t } = useAppTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const effectiveUserId = useEffectiveUserId();
  const dispatch = useAppDispatch();
  const isCreatingOrder = useAppSelector(selectIsCreatingOrder);
  const cartItems: CartItem[] = useMemo(
    () => (location.state as { cartItems?: CartItem[] })?.cartItems || [],
    [location.state],
  );

  const voucherAppliedFromCart = useMemo(() => {
    const raw = (location.state as any)?.voucherApplied;
    if (!raw) return null;
    const code = String(raw?.code ?? '').trim();
    const discount = Number(raw?.discount);
    const finalPrice = Number(raw?.finalPrice);
    if (!code) return null;
    if (!Number.isFinite(discount) || !Number.isFinite(finalPrice)) return null;
    return {
      code,
      discount,
      finalPrice,
      message: String(raw?.message ?? '').trim(),
      success: Boolean(raw?.success ?? true),
    };
  }, [location.state]);

  const [showPaypal, setShowPaypal] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cod' | 'coffee_coin'>('cod');
  const [walletCoin, setWalletCoin] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [payableTotal, setPayableTotal] = useState<number>(0);
  const voucher = useApplyVoucher();
  const autoAppliedRef = useRef(false);
  const shippingCtx = useShipping();

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    phone: user?.phoneNumber || '',
    address: user?.address || 'Số 308, Trần Hưng Đạo, Thôn 2, Sa Thầy, Kon Tum',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [form] = Form.useForm();

  const paypalRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const savingOnceRef = useRef(false);

  const productsTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const shippingFee = useMemo(
    () => calcShippingFeeVnd(productsTotal, shippingCtx.shippingMethod),
    [productsTotal, shippingCtx.shippingMethod],
  );

  const grandTotal = productsTotal + shippingFee;

  useEffect(() => {
    // Keep payableTotal in sync with voucher result (or fallback to grandTotal).
    if (voucher.isSuccess) {
      if (voucher.finalPrice != null && Number.isFinite(Number(voucher.finalPrice))) {
        setPayableTotal(Number(voucher.finalPrice));
        return;
      }
      if (voucher.discount != null && Number.isFinite(Number(voucher.discount))) {
        setPayableTotal(Math.max(0, grandTotal - Number(voucher.discount)));
        return;
      }
    }
    setPayableTotal(grandTotal);
  }, [grandTotal, voucher.discount, voucher.finalPrice, voucher.isSuccess]);

  const amountUSD = useMemo(() => {
    const usd = payableTotal / 24000;
    return usd > 0 ? usd.toFixed(2) : '0.00';
  }, [payableTotal]);

  const ensureDraftOrderId = useCallback(
    async (method?: 'paypal' | 'cod' | 'coffee_coin', captureId?: string) => {
      if (createdOrderId && Number.isFinite(createdOrderId) && createdOrderId > 0) return createdOrderId;

      const userIdToUse = Number(effectiveUserId);
      if (!userIdToUse) throw new Error('MISSING_USER_ID');

      await syncCartToSelectionForCheckout(userIdToUse, cartItems);

      const newOrder = await dispatch(
        createOrderThunk({
        user_ID: userIdToUse,
        status: 'pending',
        total_Amount: payableTotal,
        shipping_Address: `${shipping.fullName} | ${shipping.phone} | ${shipping.address}`,
        shippingMethod: shippingCtx.shippingMethod,
        paypalCaptureId: method === 'paypal' ? String(captureId ?? '') : null,
        payment_ref: method === 'paypal' ? String(captureId ?? '') : undefined,
        payment_provider: method === 'paypal' ? 'paypal' : undefined,
        payment_status: method === 'paypal' ? 'captured' : undefined,
        payment_method:
          method === 'coffee_coin' ? 'COFFEE_COIN' : method === 'paypal' ? 'PAYPAL' : 'COD',
        note:
          method === 'paypal'
            ? `PayPal | capture: ${String(captureId ?? '')}`
            : method === 'coffee_coin'
              ? 'Coffee Coin'
              : 'COD',
        items: cartItems.map((i) => ({
          product_ID: i.product_ID,
          quantity: i.quantity,
          price: Number(i.products?.price ?? i.price ?? 0),
        })),
        paymentMethod: method === 'coffee_coin' ? 'COFFEE_COIN' : method === 'paypal' ? 'PayPal' : 'COD',
        }),
      ).unwrap();

      const id = Number(
        (newOrder as any)?.order_ID ??
          (newOrder as any)?.orderId ??
          (newOrder as any)?.id ??
          (newOrder as any)?.data?.order_ID ??
          (newOrder as any)?.data?.orderId ??
          (newOrder as any)?.data?.id,
      );

      if (!Number.isFinite(id) || id <= 0) throw new Error('INVALID_ORDER_ID');
      setCreatedOrderId(id);
      return id;
    },
    [
      createdOrderId,
      effectiveUserId,
      cartItems,
      payableTotal,
      shipping.fullName,
      shipping.phone,
      shipping.address,
      dispatch,
      shippingCtx.shippingMethod,
    ],
  );

  const handleApplyVoucher = useCallback(
    async (codeOverride?: string) => {
      const codeToUse = String(codeOverride ?? voucher.trimmedCode).trim();
      if (!codeToUse) {
        voucher.applyVoucher({ orderValue: payableTotal, code: '' });
        return;
      }

      try {
        const res = await voucher.applyVoucher({ orderValue: payableTotal, code: codeToUse });
        if (res?.success && Number.isFinite(res.finalPrice) && res.finalPrice >= 0) {
          setPayableTotal(res.finalPrice);
        }
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? ((err.response?.data as any)?.message ?? (err.response?.data as any)?.error)
          : (err as Error)?.message;
        toastErrorWithFallback(i18nKeys.toast.order.voucherApplyFailed, msg ? String(msg) : undefined);
      }
    },
    [voucher, payableTotal],
  );

  useEffect(() => {
    const search = String(location.search ?? '');
    const fromQuery = new URLSearchParams(search).get('voucher')?.trim() ?? '';
    let code = fromQuery;
    if (!code) {
      try {
        code = localStorage.getItem('checkout_voucher_code')?.trim() ?? '';
        if (code) localStorage.removeItem('checkout_voucher_code');
      } catch {
        // ignore
      }
    }
    if (!code) return;
    if (autoAppliedRef.current) return;
    if (!cartItems.length) return;

    // If Cart already applied successfully, don't call API again (some backends consume voucher usage).
    if (voucherAppliedFromCart?.success && voucherAppliedFromCart.code) {
      voucher.hydrateApplied(voucherAppliedFromCart);
      if (Number.isFinite(voucherAppliedFromCart.finalPrice) && voucherAppliedFromCart.finalPrice >= 0) {
        setPayableTotal(voucherAppliedFromCart.finalPrice);
      }
      autoAppliedRef.current = true;
      return;
    }

    voucher.setCode(code);
    autoAppliedRef.current = true;
    void handleApplyVoucher(code);
  }, [location.search, cartItems.length, handleApplyVoucher, voucher, voucherAppliedFromCart]);

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
            : (data?.data?.clientId ?? data?.data?.clientID ?? data?.clientId ?? data?.clientID);

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
        setError(t('checkout.paypalSdkError'));
        setLoadingSdk(false);
      };
      document.body.appendChild(script);
    } catch (e) {
      setLoadingSdk(false);
      setError((e as Error).message || t('checkout.paypalLoadError'));
    }
  };

  const handleSaveOrder = async (opts: { method: 'paypal' | 'cod' | 'coffee_coin'; captureId?: string }) => {
    if (savingOnceRef.current) return;
    savingOnceRef.current = true;
    try {
      await ensureDraftOrderId(opts.method, opts.captureId);

      const uid = Number(effectiveUserId);
      if (Number.isFinite(uid) && uid > 0) {
        await qc.invalidateQueries({ queryKey: [...CART_KEY, uid] });
      }
      if (opts.method === 'coffee_coin') {
        await fetchWalletCoin();
      }

      toastSuccess(i18nKeys.toast.order.created);
      navigate('/profile?tab=orders&status=Pending');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save order failed:', err);
      const serverMsg = axios.isAxiosError(err)
        ? ((err.response?.data as any)?.message ??
          (err.response?.data as any)?.error ??
          (typeof err.response?.data === 'string' ? err.response?.data : null))
        : null;

      setError(serverMsg ? `${t('checkout.saveOrderError')}: ${serverMsg}` : t('checkout.saveOrderError'));
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
        onApprove: async (data: any, actions: any) => {
          let captureId = '';
          try {
            const capture = await actions.order.capture();
            captureId = String((capture as any)?.id ?? '').trim();
          } catch (e: any) {
            const msg = String(e?.message ?? '');
            const buyerTokenMissing = msg.toLowerCase().includes('buyer access token not present');
            const fallbackOrderId = String(data?.orderID ?? data?.orderId ?? '').trim();
            // Some environments block PayPal smart API capture (missing buyer token).
            // Backend currently stores a reference only, so fall back to orderID to avoid blocking checkout.
            if (buyerTokenMissing && fallbackOrderId) {
              captureId = fallbackOrderId;
            } else {
              throw e;
            }
          }
          if (!captureId) {
            const fallbackOrderId = String(data?.orderID ?? data?.orderId ?? '').trim();
            if (fallbackOrderId) captureId = fallbackOrderId;
          }
          setShowPaypal(false);
          await handleSaveOrder({ method: 'paypal', captureId });
        },
        onError: (err: any) => {
          // eslint-disable-next-line no-console
          console.error(err);
          const paypalMsg =
            String(err?.message ?? err?.details?.[0]?.description ?? err?.details?.[0]?.issue ?? '').trim();
          setError(paypalMsg ? `${t('checkout.paypalError')}: ${paypalMsg}` : t('checkout.paypalError'));
          // Reset PayPal UI so user can retry cleanly.
          setShowPaypal(false);
          renderedRef.current = false;
        },
      })
      .render(paypalRef.current!);
  }, [showPaypal, sdkReady, amountUSD, t]);

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
          <span className="text-sm text-stone-500 dark:text-stone-400">{t('checkout.redirecting')}</span>
        </div>
      </EditorialPageShell>
    );
  }

  return (
    <EditorialPageShell innerClassName="pb-20">
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-sm bg-white p-6 shadow-sm dark:bg-[#1a1a1a]">
          <div className="mb-4 flex items-center gap-2 text-orange-600">
            <EnvironmentOutlined className="text-xl" />
            <span className="text-lg font-medium">{t('checkout.shippingTitle')}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="min-w-[200px] font-bold uppercase tracking-wide text-stone-900 dark:text-stone-100">
              {shipping.fullName} ({shipping.phone})
            </div>
            <div className="flex-1 text-stone-700 dark:text-stone-300">
              {shipping.address}
              <span className="ml-4 rounded border border-orange-600 px-1 py-0.5 text-[10px] text-orange-600">
                {t('checkout.defaultBadge')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                form.setFieldsValue(shipping);
                setIsModalOpen(true);
              }}
              className="text-sm font-medium text-blue-500 hover:underline"
            >
              {t('checkout.change')}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-sm bg-white shadow-sm dark:bg-[#1a1a1a]">
          <div className="grid grid-cols-12 border-b border-stone-50 px-6 py-4 text-sm font-medium text-stone-500 dark:border-stone-800">
            <div className="col-span-12 text-lg font-bold text-stone-900 dark:text-stone-100 md:col-span-6">
              {t('checkout.tableProduct')}
            </div>
            <div className="col-span-2 hidden text-center md:block">{t('checkout.tableUnit')}</div>
            <div className="col-span-2 hidden text-center md:block">{t('checkout.tableQty')}</div>
            <div className="col-span-2 hidden text-right md:block">{t('checkout.tableLine')}</div>
          </div>

          <div className="flex items-center gap-2 border-b border-stone-50 px-6 py-3 dark:border-stone-800">
            <span className="rounded bg-orange-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {t('checkout.sellerFavorite')}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold">
              {t('checkout.storeOfficial')} <ShopOutlined />
            </span>
            <span className="ml-4 flex items-center gap-1 border-l border-stone-200 pl-4 text-xs text-green-600 dark:border-stone-800">
              <MessageOutlined /> {t('checkout.chatNow')}
            </span>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.cartitem_ID}
              className="grid grid-cols-12 items-center gap-4 border-b border-stone-50 px-6 py-6 last:border-0 dark:border-stone-800"
            >
              <div className="col-span-12 flex gap-4 md:col-span-6">
                <img
                  src={getImageSrc(item.products?.image)}
                  alt=""
                  className="h-12 w-12 rounded border border-stone-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm text-stone-900 dark:text-stone-100">
                    {item.products
                      ? translatedProductName(t, { product_ID: item.product_ID, name: item.products.name ?? '' })
                      : t('order.productFallback', { id: item.product_ID })}
                  </h4>
                  <div className="mt-1 text-[10px] uppercase tracking-tighter text-stone-400">
                    {t('checkout.categoryDefault')}
                  </div>
                </div>
              </div>
              <div className="col-span-4 text-center text-sm md:col-span-2">
                {formatPrice(item.products?.price || item.price || 0)}
              </div>
              <div className="col-span-4 text-center text-sm md:col-span-2">{item.quantity}</div>
              <div className="col-span-4 text-right text-sm font-medium md:col-span-2">
                {formatPrice((item.products?.price || item.price || 0) * item.quantity)}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 items-start gap-8 border-t border-dashed border-stone-100 bg-blue-50/20 px-6 py-6 dark:border-stone-800 dark:bg-blue-900/5 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex max-w-md items-center gap-4">
                <span className="min-w-[60px] whitespace-nowrap text-sm">{t('checkout.noteLabel')}</span>
                <input
                  className="flex-1 rounded border border-stone-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-stone-400 dark:border-stone-800 dark:bg-[#222]"
                  placeholder={t('checkout.notePlaceholder')}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TagOutlined className="text-orange-600" />
                <span>{t('checkout.shopVoucher')}</span>
              </div>
              <div className="max-w-xl">
                <VoucherInput
                  code={voucher.code}
                  onCodeChange={voucher.setCode}
                  onApply={(trimmed: string) => void handleApplyVoucher(trimmed)}
                  isApplying={voucher.isApplying}
                  errorMessage={voucher.errorMessage}
                  helperText={t('checkout.voucherHelper')}
                />
                <VoucherSummary
                  discount={voucher.discount}
                  finalPrice={voucher.finalPrice}
                  message={voucher.message}
                  isSuccess={voucher.isSuccess}
                  formatPrice={formatPrice}
                  onClear={() => {
                    voucher.reset();
                    setPayableTotal(grandTotal);
                  }}
                />
              </div>
            </div>
            <div className="space-y-4 border-dashed border-stone-100 pl-0 md:border-l md:pl-8 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CarOutlined className="text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium text-green-600">
                      {t('checkout.shippingCarrier')}: {' '}
                      {shippingCtx.method.id === 'express' ? t('checkout.shippingExpress') : t('checkout.shippingStandard')}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {t('checkout.shippingEta')} {shippingCtx.getEstimateText()}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {t('checkout.inspection')} <EnvironmentOutlined className="text-[8px]" />
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    className="mr-4 text-blue-500 hover:underline"
                    onClick={() => setIsShippingModalOpen(true)}
                  >
                    {t('checkout.change')}
                  </button>
                  <span className="font-medium">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <div className="text-[10px] text-stone-400">
                {shippingCtx.methods[shippingCtx.shippingMethod].daysMin}-{shippingCtx.methods[shippingCtx.shippingMethod].daysMax} {t('checkout.shippingDays')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-stone-50 bg-[#fafdff] px-6 py-4 dark:border-stone-800 dark:bg-[#1a1c1d]">
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {t('checkout.totalWithCount', { count: cartItems.length })}
            </span>
            <span className="text-xl font-bold text-orange-600">{formatPrice(payableTotal)}</span>
          </div>
        </div>

        <div className="rounded-sm bg-white shadow-sm dark:bg-[#1a1a1a]">
          <div className="flex flex-col gap-4 border-b border-stone-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
            <span className="text-lg font-medium">{t('checkout.paymentTitle')}</span>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-stone-200 hover:border-orange-600 dark:border-stone-800'
                }`}
              >
                {t('checkout.payCod')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-stone-200 hover:border-orange-600 dark:border-stone-800'
                }`}
              >
                {t('checkout.payPaypal')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('coffee_coin')}
                className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                  paymentMethod === 'coffee_coin'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-stone-200 hover:border-orange-600 dark:border-stone-800'
                }`}
              >
                {t('checkout.payCoffeeCoin')}
              </button>
            </div>
          </div>

          {paymentMethod === 'coffee_coin' && (
            <div className="border-b border-stone-50 px-6 py-3 text-sm dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">{t('checkout.walletLabel')}{' '}</span>
              <span className="font-semibold text-orange-600">
                {walletLoading ? t('checkout.walletLoading') : `${Number(walletCoin ?? 0).toLocaleString('vi-VN')} Coin`}
              </span>
              {!walletLoading && walletCoin != null && walletCoin < grandTotal && (
                <span className="ml-3 text-red-500">{t('checkout.walletInsufficient')}</span>
              )}
            </div>
          )}

          <div className="flex flex-col items-end space-y-3 bg-[#fffefb] p-10 dark:bg-[#1a1a1a]">
            <div className="grid min-w-[300px] grid-cols-2 gap-x-20 gap-y-3 text-right text-sm text-stone-500 dark:text-stone-400">
              <span>{t('checkout.summarySubtotal')}</span>
              <span className="text-stone-900 dark:text-stone-100">{formatPrice(productsTotal)}</span>
              <span>{t('checkout.summaryShipping')}</span>
              <span className="text-stone-900 dark:text-stone-100">{formatPrice(shippingFee)}</span>
              {voucher.discount != null && voucher.isSuccess && (
                <>
                  <span>{t('checkout.summaryVoucher')}</span>
                  <span className="text-green-700 dark:text-green-400">- {formatPrice(Number(voucher.discount ?? 0))}</span>
                </>
              )}
              <span className="mt-2 text-lg font-medium">{t('checkout.summaryTotal')}</span>
              <span className="mt-2 text-3xl font-bold text-orange-600">{formatPrice(payableTotal)}</span>
            </div>

            {error ? <Alert type="error" showIcon message={error} className="mt-4 w-full max-w-md" /> : null}

            <div className="flex w-full flex-col items-end border-t border-stone-100 pt-6 dark:border-stone-800">
              <p className="mb-6 text-xs text-stone-400 dark:text-stone-500">{t('checkout.termsHint')}</p>
              {!showPaypal ? (
                <Button
                  type="primary"
                  className="h-12 rounded-sm border-none bg-orange-600 px-14 text-lg font-bold hover:bg-orange-700"
                  loading={isCreatingOrder}
                  disabled={
                    paymentMethod === 'coffee_coin' &&
                    !walletLoading &&
                    walletCoin != null &&
                    walletCoin < payableTotal
                  }
                  onClick={handlePlaceOrder}
                >
                  {t('checkout.placeOrder')}
                </Button>
              ) : (
                <div className="w-full max-w-sm">
                  {loadingSdk && (
                    <div className="py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <Spin />
                        <span className="text-xs text-stone-500 dark:text-stone-400">{t('checkout.loadingPaypal')}</span>
                      </div>
                    </div>
                  )}
                  <div ref={paypalRef} />
                  <Button block className="mt-2" onClick={() => setShowPaypal(false)}>
                    {t('checkout.back')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Chatbox />

      <Modal
        title={t('checkout.modalTitle')}
        open={isModalOpen}
        onOk={() => {
          void form.validateFields().then((values) => {
            setShipping(values);
            setIsModalOpen(false);
          });
        }}
        onCancel={() => setIsModalOpen(false)}
        okText={t('checkout.modalOk')}
        cancelText={t('common.cancel')}
        okButtonProps={{ className: 'bg-orange-600 hover:bg-orange-700' }}
      >
        <Form form={form} layout="vertical" initialValues={shipping} className="pt-4">
          <Form.Item
            name="fullName"
            label={t('checkout.formName')}
            rules={[{ required: true, message: t('checkout.formNameRequired') }]}
          >
            <Input placeholder={t('checkout.formNamePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t('checkout.formPhone')}
            rules={[{ required: true, message: t('checkout.formPhoneRequired') }]}
          >
            <Input placeholder={t('checkout.formPhonePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="address"
            label={t('checkout.formAddress')}
            rules={[{ required: true, message: t('checkout.formAddressRequired') }]}
          >
            <Input.TextArea rows={3} placeholder={t('checkout.formAddressPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('checkout.shippingMethodTitle')}
        open={isShippingModalOpen}
        onCancel={() => setIsShippingModalOpen(false)}
        footer={null}
      >
        <div className="space-y-3 pt-2">
          {(['standard', 'express'] as const).map((id) => {
            const isActive = shippingCtx.shippingMethod === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  shippingCtx.setShippingMethod(id);
                  setIsShippingModalOpen(false);
                }}
                className={[
                  'w-full rounded-lg border px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                    : 'border-stone-200 hover:border-orange-200 dark:border-stone-800 dark:hover:border-white/20',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {id === 'express' ? t('checkout.shippingExpress') : t('checkout.shippingStandard')}
                    </div>
                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                      {shippingCtx.methods[id].daysMin}-{shippingCtx.methods[id].daysMax} {t('checkout.shippingDays')}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {formatPrice(calcShippingFeeVnd(productsTotal, id))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    </EditorialPageShell>
  );
};

export default OrderPage;

