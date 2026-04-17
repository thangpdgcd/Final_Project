import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Loader2,
  ShoppingBag,
  Bell,
  Ticket,
  Wallet,
  User,
  Settings,
  Headphones,
  Tag,
  Camera,
} from 'lucide-react';
import { ProfileCard, MenuCard } from '@/features/users/components/profile';
import { useTheme } from '@/store/ThemeContext';
import { App, Modal, InputNumber, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import * as profileApi from '@/api/profileApi';
import { getImageSrc } from '@/utils/image';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useOrders, ordersService, OrderItemCard, type OrderItemRowAction } from '@/features/orders';
import { useAddToCart } from '@/features/cart';
import { useProducts } from '@/features/products';
import {
  formatPrice,
  getWalletTransactionLabel,
  PROFILE_THEME_TOKENS,
} from '@/features/users/utils/profileConstants';
import type { Order, Product } from '@/types';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAYPAL_CONFIG_PATHS = ['/payment/config', '/paypal/config', '/config/paypal'] as const;
const paypalDebug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[PayPalTopup]', ...args);
  }
};

// ---------------------------------------------------------------------------
// OrderItemsSummary — completely unchanged logic
// ---------------------------------------------------------------------------

const OrderItemsSummary: React.FC<{
  orderId: number;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewProduct: (productId: number) => void;
  onContactSeller: () => void;
  busyRowKey: string | null;
}> = ({ orderId, onBuyAgainItem, onViewProduct, onContactSeller, busyRowKey }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: products = [] } = useProducts();

  const productMap = useMemo(() => {
    const m = new Map<number, Product>();
    for (const p of products) {
      const id = Number((p as any)?.product_ID ?? (p as any)?.productId ?? (p as any)?.id);
      if (Number.isFinite(id) && id > 0) m.set(id, p);
    }
    return m;
  }, [products]);

  useEffect(() => {
    if (!orderId) return;
    const fetchItems = async () => {
      try {
        const res = await ordersService.getItemsByOrderId(orderId);
        setItems(res || []);
      } catch (e) {
        console.error('Error fetching order items:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [orderId]);

  const mergedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const getProductId = (raw: any) =>
      Number(raw?.product_ID ?? raw?.productId ?? raw?.products?.product_ID ?? raw?.products?.id);
    const acc = new Map<number, any>();
    const passthrough: any[] = [];
    for (const raw of items) {
      const pid = getProductId(raw);
      const qty = Number(raw?.quantity ?? 0);
      const price = Number(raw?.price ?? 0);
      if (!Number.isFinite(pid) || pid <= 0) {
        passthrough.push(raw);
        continue;
      }
      const prev = acc.get(pid);
      if (!prev) {
        acc.set(pid, {
          ...raw,
          product_ID: pid,
          quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
          price: Number.isFinite(price) && price >= 0 ? price : 0,
        });
        continue;
      }
      const prevQty = Number(prev?.quantity ?? 0);
      acc.set(pid, {
        ...prev,
        quantity:
          (Number.isFinite(prevQty) && prevQty > 0 ? prevQty : 0) +
          (Number.isFinite(qty) && qty > 0 ? qty : 1),
        price:
          Number.isFinite(prev?.price) && Number(prev.price) > 0
            ? prev.price
            : Number.isFinite(price) && price >= 0
            ? price
            : prev?.price,
      });
    }
    return [...passthrough, ...Array.from(acc.values())];
  }, [items]);

  if (!orderId) return null;
  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="animate-pulse flex gap-4 my-2"
      >
        <div className="w-16 h-16 bg-[#2a2a2a] rounded-xl" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 bg-[#2a2a2a] rounded w-3/4" />
          <div className="h-3 bg-[#2a2a2a] rounded w-1/4" />
        </div>
      </motion.div>
    );

  if (!mergedItems.length)
    return (
      <div className="text-xs text-[#d1c5b6]/50 italic py-2">
        {t('profile.orders.productInfoPending')}
      </div>
    );

  return (
    <motion.div layout className="grid gap-4">
      <AnimatePresence mode="popLayout">
        {mergedItems.map((raw, idx) => (
          <OrderItemCard
            key={String(raw?.orderitem_ID ?? `${orderId}-${idx}`)}
            raw={raw}
            idx={idx}
            orderId={orderId}
            productMap={productMap}
            busyRowKey={busyRowKey}
            onBuyAgainItem={onBuyAgainItem}
            onViewProduct={onViewProduct}
            onContactSeller={onContactSeller}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const { user, login } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAddToCart();

  const { dark } = useTheme();
  const T = dark ? PROFILE_THEME_TOKENS.dark : PROFILE_THEME_TOKENS.light;
  const walletTransactionLabels = useMemo(
    () => ({
      topup: t('profile.wallet.topup'),
      refund: t('profile.wallet.refund'),
      spend: t('profile.wallet.spend'),
      fallback: t('profile.wallet.transactionFallback'),
    }),
    [t],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buyAgainRowKey, setBuyAgainRowKey] = useState<string | null>(null);
  const [refundBusyOrderId, setRefundBusyOrderId] = useState<number | null>(null);
  const [refundConfirmOrder, setRefundConfirmOrder] = useState<Order | null>(null);
  const [walletXu, setWalletXu] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<Array<{
    id?: number;
    type?: string;
    amountXu?: number;
    balanceAfter?: number;
    source?: string;
    referenceId?: string;
    note?: string;
    createdAt?: string;
  }>>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupXu, setTopupXu] = useState<number>(50000);
  const [topupBusy, setTopupBusy] = useState(false);
  const [topupSdkReady, setTopupSdkReady] = useState(false);
  const [topupSdkLoading, setTopupSdkLoading] = useState(false);
  const [topupError, setTopupError] = useState('');
  const [topupRenderKey, setTopupRenderKey] = useState(0);
  const [topupModalReady, setTopupModalReady] = useState(false);
  const [topupButtonRendered, setTopupButtonRendered] = useState(false);
  const topupPaypalRef = useRef<HTMLDivElement | null>(null);
  const topupRenderedRef = useRef(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tab: 'profile' (IDENTITY) | 'orders'
  const currentTab = searchParams.get('tab') || 'profile';

  // Derive active sidebar key purely from URL — no local state needed.
  // "section" param distinguishes identity vs promotions on the profile tab.
  const currentSection = searchParams.get('section') || 'identity';
  const activeSideKey = currentTab === 'orders' ? 'orders' : currentSection;

  const isWalletApiDisabled = (() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('wallet:get_disabled') === '1';
    } catch {
      return false;
    }
  })();

  const isOrdersApiDisabled = (() => {
    try {
      const raw = localStorage.getItem('user');
      const roleID = raw ? String((JSON.parse(raw) as any)?.roleID ?? (JSON.parse(raw) as any)?.role ?? '') : '';
      const normalized =
        roleID === '1' || roleID.toLowerCase() === 'customer' || roleID.toLowerCase() === 'user'
          ? '1'
          : roleID === '2' || roleID.toLowerCase() === 'admin'
            ? '2'
            : roleID === '3' || roleID.toLowerCase() === 'staff'
              ? '3'
              : 'unknown';
      return typeof window !== 'undefined' && localStorage.getItem(`orders:list_disabled:${normalized}`) === '1';
    } catch {
      return false;
    }
  })();

  // ── Orders ────────────────────────────────────────────────────────────────
  const { data: allOrdersRaw, isLoading: ordersLoading, refetch: refetchOrders } = useOrders({
    // Keep order list live while user is in Orders tab (no manual reload needed).
    refetchInterval: currentTab === 'orders' ? 2000 : false,
  });
  const allOrders = useMemo<Order[]>(() => {
    if (Array.isArray(allOrdersRaw)) return allOrdersRaw;
    const v = allOrdersRaw as any;
    if (v && Array.isArray(v.orders)) return v.orders as Order[];
    if (v && Array.isArray(v.data)) return v.data as Order[];
    if (v && Array.isArray(v.result)) return v.result as Order[];
    return [];
  }, [allOrdersRaw]);

  const userOrders = useMemo<Order[]>(() => {
    return allOrders
      .filter((o: Order) => {
        const orderUserId = o.user_ID || (o as any).UserID || (o as any).userId;
        return Number(orderUserId) === Number(user?.user_ID);
      })
      .sort((a: Order, b: Order) => {
        const idA = a.order_ID || (a as any).orderId || 0;
        const idB = b.order_ID || (b as any).orderId || 0;
        return Number(idB) - Number(idA);
      });
  }, [allOrders, user]);

  type OrderTabKey = 'all' | 'Pending' | 'Shipping' | 'To Receive' | 'Completed' | 'Cancelled' | 'Refund';

  const normalizeOrderStatus = (raw: unknown): string => {
    const key = String(raw || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    const map: Record<string, string> = {
      paid: 'confirmed',
      accepted: 'confirmed',
      preparing: 'processing',
      inprogress: 'processing',
      delivering: 'shipped',
      outfordelivery: 'shipped',
      ontheway: 'shipped',
      dangiao: 'shipped',
      complete: 'completed',
      done: 'completed',
      refundrequested: 'refund_requested',
      refundrequest: 'refund_requested',
      canceled: 'cancelled',
      refund: 'refunded',
      returned: 'refunded',
      return: 'refunded',
    };
    return map[key] ?? key;
  };

  const matchesOrderTab = (rawStatus: unknown, tabKey: OrderTabKey): boolean => {
    const status = normalizeOrderStatus(rawStatus);
    switch (tabKey) {
      case 'all':
        return true;
      case 'Pending':
        return status === 'pending' || status === 'confirmed';
      case 'To Receive':
        return status === 'shipped';
      case 'Shipping':
        return status === 'shipping' || status === 'processing';
      case 'Completed':
        return status === 'completed' || status === 'sent';
      case 'Cancelled':
        return status === 'cancelled';
      case 'Refund':
        return status === 'refund_requested' || status === 'refunded';
      default:
        return false;
    }
  };

  const canUserCancelOrder = (rawStatus: unknown): boolean => {
    const status = normalizeOrderStatus(rawStatus);
    return ['pending', 'confirmed', 'processing'].includes(status);
  };

  const canUserRequestRefund = (rawStatus: unknown): boolean => {
    const status = normalizeOrderStatus(rawStatus);
    return status === 'completed' || status === 'shipped' || status === 'sent';
  };

  const getOrderStatusLabel = useCallback((normalizedStatus: string, raw: unknown) => {
    if (normalizedStatus === 'refund_requested') return t('profile.orders.status.refund_requested');
    if (normalizedStatus === 'refunded') return t('profile.orders.status.refunded');
    if (normalizedStatus === 'completed') return t('profile.orders.status.delivered');
    const known = [
      'pending',
      'confirmed',
      'processing',
      'shipping',
      'shipped',
      'sent',
      'cancelled',
    ] as const;
    if ((known as readonly string[]).includes(normalizedStatus)) {
      return t(`profile.orders.status.${normalizedStatus}`);
    }
    const rawStr = String(raw ?? '').trim();
    if (rawStr) return rawStr.toUpperCase();
    return t('profile.orders.status.pending');
  }, [t]);

  const walletDateLocale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US';

  const orderTabs = useMemo<Array<{ key: OrderTabKey; label: string }>>(
    () => [
      { key: 'all', label: t('profile.orders.tabs.all') },
      { key: 'Pending', label: t('profile.orders.tabs.pending') },
      { key: 'Shipping', label: t('profile.orders.tabs.shipping') },
      { key: 'To Receive', label: t('profile.orders.tabs.toReceive') },
      { key: 'Completed', label: t('profile.orders.tabs.completed') },
      { key: 'Cancelled', label: t('profile.orders.tabs.cancelled') },
      { key: 'Refund', label: t('profile.orders.tabs.refund') },
    ],
    [t],
  );

  const activeOrderTab = (searchParams.get('status') || 'all') as OrderTabKey;
  const filteredOrders = useMemo<Order[]>(() => {
    return userOrders.filter((o: Order) => matchesOrderTab(o.status, activeOrderTab));
  }, [userOrders, activeOrderTab]);
  const shouldScrollOrders =
    filteredOrders.length > 3 || activeOrderTab === 'Cancelled' || activeOrderTab === 'Refund';

  const fetchWallet = async (opts?: { silent?: boolean }) => {
    if (!user?.user_ID) return;
    try {
      if (!opts?.silent) setWalletLoading(true);
      const payload = await profileApi.getWallet();
      const walletValue = Number(
        (payload as any)?.walletCoin ??
          (payload as any)?.walletXu ??
          (payload as any)?.data?.walletCoin ??
          (payload as any)?.data?.walletXu ??
          (payload as any)?.data?.result?.walletXu ??
          0
      );
      setWalletXu(Number.isFinite(walletValue) ? walletValue : 0);
      const txs =
        (payload as any)?.transactions ??
        (payload as any)?.data?.transactions ??
        (payload as any)?.data?.result?.transactions ??
        [];
      setWalletTransactions(Array.isArray(txs) ? txs : []);
    } catch {
      // Keep current wallet values on transient API errors.
    } finally {
      if (!opts?.silent) setWalletLoading(false);
    }
  };

  const getPaypalClientId = async (): Promise<string> => {
    const envClientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined)?.trim();
    if (envClientId) return envClientId;
    const apiUrl = ((import.meta.env.VITE_API_URL as string | undefined) || '').trim();
    const normalizedApi = apiUrl.replace(/\/+$/, '');
    const hostBase = normalizedApi.endsWith('/api') ? normalizedApi.slice(0, -4) : normalizedApi;
    const candidateUrls = [
      ...new Set([
        ...PAYPAL_CONFIG_PATHS.map((path) => `${window.location.origin}${path}`),
        ...(hostBase ? PAYPAL_CONFIG_PATHS.map((path) => `${hostBase}${path}`) : []),
        ...(normalizedApi ? PAYPAL_CONFIG_PATHS.map((path) => `${normalizedApi}${path}`) : []),
      ]),
    ];

    for (const url of candidateUrls) {
      try {
        paypalDebug('Fetching client id from', url);
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = (await res.json()) as any;
        const clientId =
          data?.data?.clientId ?? data?.data?.clientID ?? data?.clientId ?? data?.clientID ?? data?.data;
        if (typeof clientId === 'string' && clientId.trim()) return clientId.trim();
      } catch {
        // try next candidate
      }
    }
    throw new Error('missing_paypal_client_id');
  };

  const loadTopupPaypalScript = async () => {
    try {
      setTopupError('');
      setTopupSdkLoading(true);
      if ((window as any).paypal) {
        paypalDebug('PayPal SDK already loaded');
        setTopupSdkReady(true);
        setTopupSdkLoading(false);
        return;
      }
      const clientId = await getPaypalClientId();
      paypalDebug('Resolved PayPal client id');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.setAttribute('data-paypal-sdk-topup', '1');
      script.onload = () => {
        paypalDebug('PayPal SDK loaded');
        setTopupSdkReady(true);
        setTopupSdkLoading(false);
      };
      script.onerror = () => {
        paypalDebug('PayPal SDK load failed');
        setTopupError(t('profile.wallet.paypalSdkLoadFailed'));
        setTopupSdkLoading(false);
      };
      document.body.appendChild(script);
    } catch (e) {
      setTopupSdkLoading(false);
      const msg = (e as Error).message || '';
      if (msg === 'missing_paypal_client_id') {
        setTopupError(t('profile.wallet.missingPayPalClientId'));
      } else {
        setTopupError(msg || t('profile.wallet.paypalInitFailed'));
      }
    }
  };

  const handleOpenTopupModal = async () => {
    setTopupModalOpen(true);
    setTopupError('');
    setTopupBusy(false);
    setTopupButtonRendered(false);
    setTopupModalReady(false);
    topupRenderedRef.current = false;
    setTopupRenderKey((v) => v + 1);
    if (!topupSdkReady) await loadTopupPaypalScript();
  };

  const topupAmountUSD = useMemo(() => {
    const usd = Number(topupXu || 0) / 24000;
    return usd > 0 ? usd.toFixed(2) : '0.00';
  }, [topupXu]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resolveUserIdForCart = () =>
    Number(
      user?.user_ID ??
        (typeof window !== 'undefined' ? localStorage.getItem('user_ID') : null)
    );

  const handleBuyAgainOneItem = async (args: OrderItemRowAction) => {
    const resolvedUserId = resolveUserIdForCart();
    if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
      message.warning(t('profile.orders.reloginToBuyAgain'));
      return;
    }
    if (!Number.isFinite(args.productId) || args.productId <= 0) return;
    try {
      setBuyAgainRowKey(args.rowKey);
      await addToCart.mutateAsync({
        user_ID: resolvedUserId,
        product_ID: args.productId,
        quantity: args.quantity,
        price: args.price,
      });
      message.success(t('profile.orders.addToCartSuccess'));
      navigate('/cart');
    } catch (err) {
      console.error(err);
      message.error(t('profile.orders.addToCartError'));
    } finally {
      setBuyAgainRowKey(null);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const orderId = Number(order.order_ID || (order as any).orderId || 0);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      message.error(t('profile.orders.messages.orderIdMissing'));
      return;
    }
    const ok = window.confirm(t('profile.orders.messages.cancelOrderConfirm'));
    if (!ok) return;
    try {
      await ordersService.cancelOrder(orderId, { note: 'Customer cancelled from profile page' });
      message.success(t('profile.orders.messages.cancelOrderSuccess'));
      await refetchOrders();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) &&
        typeof (err.response?.data as { message?: unknown } | undefined)?.message === 'string'
          ? String((err.response?.data as { message: string }).message)
          : t('profile.orders.messages.cancelOrderError');
      message.error(msg);
    }
  };

  const submitRefundRequest = async (order: Order) => {
    const orderId = Number(order.order_ID || (order as any).orderId || 0);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      message.error(t('profile.orders.messages.orderIdMissing'));
      return;
    }
    setRefundBusyOrderId(orderId);
    try {
      await ordersService.requestRefund(orderId, { note: 'Customer requested refund from profile page' });
      message.success(t('profile.orders.messages.refundSuccess'));
      await refetchOrders();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) &&
        typeof (err.response?.data as { message?: unknown } | undefined)?.message === 'string'
          ? String((err.response?.data as { message: string }).message)
          : t('profile.orders.messages.refundError');
      message.error(msg);
    } finally {
      setRefundBusyOrderId(null);
    }
  };

  const handleRequestRefund = (order: Order) => setRefundConfirmOrder(order);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      message.error(t('profile.avatarError') || 'Upload failed');
      e.target.value = '';
      return;
    }

    const previousAvatar = previewAvatar || user.avatar || null;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);
    try {
      setIsLoading(true);
      const uploadRes = await profileApi.uploadAvatar(file);
      const uploadedAvatar = uploadRes.avatarUrl;

      // Persist avatar to profile so reloading uses server data too.
      let mergedUser: Record<string, unknown> = { ...user, avatar: uploadedAvatar };
      try {
        const profileRes = await profileApi.updateProfile({
          avatar: uploadedAvatar,
          avatarUrl: uploadedAvatar,
        });
        const profileUser = profileApi.pickUserFromProfileResponse(profileRes);
        if (profileUser) {
          mergedUser = {
            ...mergedUser,
            ...profileUser,
            avatar:
              (profileUser.avatar as string | undefined) ||
              (profileUser.avatarUrl as string | undefined) ||
              uploadedAvatar,
          };
        }
      } catch (persistError) {
        console.warn('Failed to persist avatar via /profile:', persistError);
      }

      login('', mergedUser as any);
      setPreviewAvatar(uploadedAvatar);
      message.success(t('profile.avatarSuccess') || 'Avatar updated!');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setPreviewAvatar(previousAvatar);
      message.error(t('profile.avatarError') || 'Upload failed');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const res = await profileApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      message.success(t('profile.updateSuccess') || 'Profile updated!');
      if (user) login('', { ...user, ...res.user });
      setIsEditing(false);
    } catch {
      message.error(t('profile.updateError') || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchWallet();
  }, [user?.user_ID]);

  useEffect(() => {
    if (currentTab !== 'orders') return;
    const timer = window.setInterval(() => {
      void fetchWallet({ silent: true });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [currentTab, user?.user_ID]);

  useEffect(() => {
    const w = window as any;
    if (
      !topupModalOpen ||
      !topupModalReady ||
      !topupSdkReady ||
      !w.paypal ||
      !topupPaypalRef.current ||
      topupRenderedRef.current
    ) {
      return;
    }
    const container = topupPaypalRef.current;
    container.innerHTML = '';
    topupRenderedRef.current = true;

    const renderPaypalButtons = async () => {
      paypalDebug('Rendering PayPal buttons', { topupAmountUSD, topupXu });
      const buttons = w.paypal?.Buttons?.({
        style: { layout: 'vertical', label: 'paypal' },
        createOrder: (_d: any, actions: any) =>
          actions.order.create({ purchase_units: [{ amount: { currency_code: 'USD', value: topupAmountUSD } }] }),
        onApprove: async (data: any, actions: any) => {
          try {
            setTopupBusy(true);
            paypalDebug('onApprove fired');
            let captureId = '';
            try {
              const capture = await actions.order.capture();
              captureId = String((capture as any)?.id ?? data?.orderID ?? data?.orderId ?? '').trim();
              paypalDebug('Capture success', captureId);
            } catch (captureError: any) {
              const captureMsg = String(captureError?.message || '');
              const closedEarly = captureMsg.toLowerCase().includes('window closed before response');
              const fallbackId = String(data?.orderID ?? data?.orderId ?? '').trim();
              if (closedEarly && fallbackId) {
                // PayPal popup can close before capture response is returned.
                // Backend currently stores reference only, so fallback to orderID to avoid silent no-op.
                captureId = fallbackId;
                paypalDebug('Capture fallback by orderID', captureId);
              } else {
                throw captureError;
              }
            }
            if (!captureId) {
              throw new Error('Missing PayPal reference id');
            }
            const topupRes = await profileApi.topupWallet({
              amountXu: Math.max(1000, Math.trunc(Number(topupXu) || 0)),
              paypalCaptureId: captureId,
              note: 'Wallet top-up via PayPal',
            });
            const nextWallet = Number(
              (topupRes as any)?.walletCoin ??
              (topupRes as any)?.walletXu ??
              (topupRes as any)?.data?.walletCoin ??
              (topupRes as any)?.data?.walletXu ??
              (topupRes as any)?.data?.result?.walletXu ??
              0
            );
            if (Number.isFinite(nextWallet) && nextWallet >= 0) setWalletXu(nextWallet);
            else await fetchWallet();
            // Refresh history list right after successful top-up.
            await fetchWallet();
            message.success(t('profile.wallet.topupSuccess'));
            setTopupModalOpen(false);
            topupRenderedRef.current = false;
          } catch (e) {
            const msg = String((e as Error)?.message || '');
            paypalDebug('onApprove error', msg);
            if (msg.toLowerCase().includes('window closed before response')) {
              setTopupError('');
              topupRenderedRef.current = false;
            } else {
              setTopupError(msg || t('profile.wallet.topupFailed'));
            }
          } finally {
            setTopupBusy(false);
          }
        },
        onCancel: () => {
          paypalDebug('onCancel fired');
          setTopupError('');
          setTopupBusy(false);
          topupRenderedRef.current = false;
        },
        onError: (err: any) => {
          const msg = String(err?.message || '');
          paypalDebug('onError fired', msg);
          if (msg.toLowerCase().includes('window closed before response')) {
            setTopupError('');
            topupRenderedRef.current = false;
            return;
          }
          setTopupError(msg || t('profile.wallet.paypalPaymentFailed'));
          topupRenderedRef.current = false;
        },
      });

      if (!buttons) {
        setTopupError(t('profile.wallet.paypalButtonsInitFailed'));
        setTopupButtonRendered(false);
        topupRenderedRef.current = false;
        return;
      }
      if (typeof buttons.isEligible === 'function' && !buttons.isEligible()) {
        setTopupError(t('profile.wallet.paypalNotReady'));
        setTopupButtonRendered(false);
        topupRenderedRef.current = false;
        return;
      }
      try {
        await buttons.render(container);
        paypalDebug('PayPal buttons rendered');
        setTopupButtonRendered(true);
        setTopupError('');
      } catch (err: any) {
        const msg = String(err?.message || '');
        paypalDebug('PayPal render failed', msg);
        setTopupError(msg || t('profile.wallet.paypalRenderFailed'));
        setTopupButtonRendered(false);
        topupRenderedRef.current = false;
      }
    };

    const tid = window.setTimeout(() => {
      void renderPaypalButtons();
    }, 250);
    return () => window.clearTimeout(tid);
  }, [topupModalOpen, topupModalReady, topupSdkReady, topupAmountUSD, topupXu, message, topupRenderKey, t]);

  // ── Menu grid items ───────────────────────────────────────────────────────
  const menuItems = useMemo(
    () => [
      {
        icon: <User size={20} />,
        label: t('profile.menu.myAccount.title'),
        sub: t('profile.menu.myAccount.description'),
        action: () => setSearchParams({ tab: 'profile' }),
      },
      {
        icon: <Ticket size={20} />,
        label: t('profile.menu.vouchers.title'),
        sub: t('profile.menu.vouchers.description'),
        action: () => {},
      },
      {
        icon: <ShoppingBag size={20} />,
        label: t('profile.menu.orders.title'),
        sub: t('profile.menu.orders.description'),
        action: () => setSearchParams({ tab: 'orders' }),
      },
      {
        icon: <Settings size={20} />,
        label: t('profile.menu.settings.title'),
        sub: t('profile.menu.settings.description'),
        action: () => {},
      },
      {
        icon: <Bell size={20} />,
        label: t('profile.menu.notifications.title'),
        sub: t('profile.menu.notifications.description'),
        action: () => {},
      },
      {
        icon: <Headphones size={20} />,
        label: t('profile.menu.help.title'),
        sub: t('profile.menu.help.description'),
        action: () => navigate('/contacts'),
      },
    ],
    [navigate, setSearchParams, t],
  );

  // ── Sidebar nav items ─────────────────────────────────────────────────────
  const sideNavItems = useMemo(
    () => [
      {
        key: 'identity',
        icon: <User size={14} />,
        label: t('profile.sideNav.account'),
        tab: 'profile' as const,
        section: 'identity' as const,
      },
      {
        key: 'orders',
        icon: <ShoppingBag size={14} />,
        label: t('profile.sideNav.orders'),
        tab: 'orders' as const,
        section: null,
      },
      {
        key: 'promotions',
        icon: <Tag size={14} />,
        label: t('profile.sideNav.promotions'),
        tab: 'profile' as const,
        section: 'promotions' as const,
      },
    ],
    [t],
  );

  const profileStats = useMemo(
    () => [
      {
        key: 'orders',
        label: t('profile.stats.orders'),
        value: isOrdersApiDisabled ? t('common.notAvailableShort') : userOrders.length,
        icon: <ShoppingBag size={16} />,
      },
      {
        key: 'voucher',
        label: t('profile.stats.voucher'),
        value: '—',
        icon: <Ticket size={16} />,
      },
      {
        key: 'coffeeCoin',
        label: t('profile.stats.coffeeCoin'),
        value: isWalletApiDisabled
          ? t('common.notAvailableShort')
          : walletLoading
            ? t('profile.stats.loadingShort')
            : walletXu.toLocaleString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US'),
        icon: <Wallet size={16} />,
      },
    ],
    [i18n.language, isOrdersApiDisabled, isWalletApiDisabled, t, userOrders.length, walletLoading, walletXu],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ background: T.bg, fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen pt-24 pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6">

        {/* ================================================================
            SIDEBAR
        ================================================================= */}
        <aside
          style={{ background: T.surfaceLow }}
          className="w-full md:w-64 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Avatar + name block */}
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="relative group">
              {/* Squircle avatar: 2px gold border + 4px ring gap */}
              <div
                className="rounded-[22px] border-2 ring-4 overflow-hidden w-20 h-20"
                style={{ borderColor: T.gold }}
              >
                <img
                  src={getImageSrc(previewAvatar || user?.avatar)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://ui-avatars.com/api/?name=User&background=1c1b1b&color=e5c18b&size=128';
                  }}
                />
              </div>
              {/* Camera overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'rgba(14,14,14,0.75)', color: T.gold }}
                className="absolute inset-0 rounded-[22px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Camera size={18} />
              </button>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: T.onSurface,
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {user?.name || t('profile.guest')}
              </p>
              <span
                style={{
                  background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                  color: T.surfaceLowest,
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                }}
                className="inline-block mt-1 px-2 py-0.5 rounded-full"
              >
                {t('profile.premiumMemberBadge')}
              </span>
            </div>
          </div>

          {/* Divider via tonal shift */}
          <div style={{ background: T.surfaceLowest, height: 1, opacity: 0.4, margin: '0 20px' }} />

          {/* Nav items */}
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {sideNavItems.map(item => {
              const active = activeSideKey === item.key;
              return (
                <motion.button
                  key={item.key}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const params: Record<string, string> = { tab: item.tab };
                    if (item.section) params.section = item.section;
                    setSearchParams(params);
                  }}
                  style={{
                    color: active ? T.gold : T.onSurfaceVariant,
                    background: active ? `${T.gold}12` : 'transparent',
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    transition: 'all 300ms ease-out',
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer"
                >
                  <span style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                  {item.label}
                </motion.button>
              );
            })}
          </nav>

        </aside>

        {/* ================================================================
            MAIN PANEL
        ================================================================= */}
        <div className="flex-1 flex flex-col gap-5">

          {/* ── Hero card ─────────────────────────────────────────── */}
          <ProfileCard
            user={user}
            previewAvatar={previewAvatar}
            isEditing={isEditing}
            isLoading={isLoading}
            currentTab={currentTab}
            ordersCount={userOrders.length}
            onAvatarClick={() => fileInputRef.current?.click()}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />

          {/* ── Stats bar ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {profileStats.map(stat => (
              <div
                key={stat.key}
                style={{ background: T.surfaceLow }}
                className="rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      color: T.onSurfaceVariant,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {stat.label}
                  </span>
                  <span style={{ color: `${T.gold}70` }}>{stat.icon}</span>
                </div>
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    color: T.onSurface,
                    fontWeight: 800,
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                {stat.key === 'coffeeCoin' && !isWalletApiDisabled && (
                  <button
                    type="button"
                    onClick={() => void handleOpenTopupModal()}
                    style={{
                      marginTop: 8,
                      color: T.gold,
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                    className="text-left hover:underline"
                  >
                    {t('profile.stats.topupPaypal')}
                  </button>
                )}
              </div>
            ))}
          </motion.div>

          {/* ================================================================
              TAB: IDENTITY — Edit Profile Form
          ================================================================= */}
          <AnimatePresence mode="wait">
            {currentTab === 'profile' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ background: T.surfaceLow }}
                className="rounded-2xl p-6"
              >
                <h2
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    color: T.onSurface,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    marginBottom: '1.5rem',
                    opacity: 0.6,
                  }}
                >
                  {t('profile.identity.sectionTitle')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Read-only email / username */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{
                        color: T.onSurfaceVariant,
                        fontSize: '0.7rem',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                      }}
                    >
                      {t('profile.identity.accountLabel')}
                    </label>
                    <div
                      style={{
                        background: T.surfaceLowest,
                        color: `${T.onSurface}60`,
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {user?.email?.split('@')[0]}
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{
                        color: T.onSurfaceVariant,
                        fontSize: '0.7rem',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                      }}
                    >
                      {t('profile.identity.emailLabel')}
                    </label>
                    <div
                      style={{
                        background: T.surfaceLowest,
                        color: `${T.onSurface}60`,
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {user?.email}
                    </div>
                  </div>

                  {/* Editable fields */}
                  {[
                    { name: 'name', label: t('profile.identity.fieldName'), placeholder: t('profile.identity.placeholderName') },
                    { name: 'phoneNumber', label: t('profile.identity.fieldPhone'), placeholder: t('profile.identity.placeholderPhone') },
                    { name: 'address', label: t('profile.identity.fieldAddress'), placeholder: t('profile.identity.placeholderAddress') },
                  ].map(field => (
                    <div
                      key={field.name}
                      className={field.name === 'address' ? 'md:col-span-2' : ''}
                    >
                      <div className="flex flex-col gap-1.5">
                        <label
                          style={{
                            color: T.onSurfaceVariant,
                            fontSize: '0.7rem',
                            fontFamily: "'Manrope', sans-serif",
                            fontWeight: 600,
                            letterSpacing: '0.07em',
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          name={field.name}
                          disabled={!isEditing}
                          value={(formData as any)[field.name]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          style={{
                            background: T.surfaceLowest,
                            color: isEditing ? T.onSurface : `${T.onSurface}70`,
                            border: `1px solid ${isEditing ? T.gold + '50' : T.onSurface + '15'}`,
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontFamily: "'Inter', sans-serif",
                            outline: 'none',
                            transition: 'border-color 300ms ease-out',
                            width: '100%',
                          }}
                          onFocus={e => {
                            if (isEditing) e.currentTarget.style.borderColor = T.gold;
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = isEditing
                              ? `${T.gold}50`
                              : `${T.onSurface}15`;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save / Edit button row */}
                <div className="flex justify-end mt-6 gap-3">
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsEditing(false)}
                      style={{
                        color: T.onSurfaceVariant,
                        border: `1px solid ${T.onSurface}15`,
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        borderRadius: '0.75rem',
                        background: 'transparent',
                      }}
                      className="px-5 py-2.5"
                    >
                      {t('profile.identity.cancelEdit')}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                    style={{
                      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                      color: T.surfaceLowest,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      borderRadius: '0.75rem',
                      boxShadow: `0 8px 32px -8px ${T.gold}50`,
                      transition: 'all 300ms ease-out',
                    }}
                    className="px-8 py-2.5 inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {isLoading && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? t('profile.identity.saveChangesCaps') : t('profile.identity.editProfileCaps')}
                  </motion.button>
                </div>

              </motion.div>
            )}

            {/* ================================================================
                TAB: ORDERS
            ================================================================= */}
            {currentTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Order status tabs */}
                <div
                  style={{ background: T.surfaceLow }}
                  className="rounded-2xl overflow-hidden"
                >
                  <div className="flex overflow-x-auto scroller-hidden">
                    {orderTabs.map(tab => {
                      const active = (searchParams.get('status') || 'all') === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSearchParams({ tab: 'orders', status: tab.key })}
                          style={{
                            color: active ? T.gold : T.onSurfaceVariant,
                            borderBottom: active ? `2px solid ${T.gold}` : '2px solid transparent',
                            fontFamily: "'Manrope', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            transition: 'all 300ms ease-out',
                            background: 'transparent',
                          }}
                          className="flex-1 min-w-[110px] py-4 text-center whitespace-nowrap"
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order cards */}
                <div className="min-h-[520px]">
                {ordersLoading ? (
                  <div
                    style={{ background: T.surfaceLow }}
                    className="p-12 text-center rounded-2xl flex flex-col items-center gap-4"
                  >
                    <Loader2
                      className="animate-spin"
                      size={28}
                      style={{ color: T.gold }}
                    />
                    <p style={{ color: T.onSurfaceVariant, fontSize: '0.875rem' }}>
                      {t('profile.orders.loadingOrders')}
                    </p>
                  </div>
                ) : isOrdersApiDisabled ? (
                  <div
                    style={{ background: T.surfaceLow }}
                    className="p-20 rounded-2xl flex flex-col items-center gap-4"
                  >
                    <div
                      style={{ background: T.surfaceLowest }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                    >
                      <ShoppingBag size={40} style={{ color: T.onSurfaceVariant, opacity: 0.3 }} />
                    </div>
                    <p
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        color: T.onSurface,
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {t('common.notAvailable')}
                    </p>
                    <p style={{ color: T.onSurfaceVariant, fontSize: '0.82rem', opacity: 0.7 }}>
                      {t('profile.orders.apiNotAvailableHint')}
                    </p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div
                    style={{ background: T.surfaceLow }}
                    className="p-20 rounded-2xl flex flex-col items-center gap-4"
                  >
                    <div
                      style={{ background: T.surfaceLowest }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                    >
                      <ShoppingBag size={40} style={{ color: T.onSurfaceVariant, opacity: 0.3 }} />
                    </div>
                    <p
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        color: T.onSurface,
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {t('profile.orders.emptyTitle')}
                    </p>
                    <p style={{ color: T.onSurfaceVariant, fontSize: '0.82rem', opacity: 0.7 }}>
                      {t('profile.orders.emptySubtitle')}
                    </p>
                    <Link
                      to="/products"
                      style={{
                        background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                        color: T.surfaceLowest,
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        letterSpacing: '0.06em',
                        borderRadius: '0.75rem',
                        padding: '0.625rem 1.5rem',
                        marginTop: '0.5rem',
                        display: 'inline-block',
                      }}
                    >
                      {t('profile.orders.shopNow')}
                    </Link>
                  </div>
                ) : (
                  <div
                    className={`space-y-4 pr-1 ${
                      shouldScrollOrders ? 'max-h-[760px] overflow-y-auto' : ''
                    }`}
                    style={{
                      scrollbarGutter: 'stable',
                    }}
                  >
                    {filteredOrders.map((order: Order, orderIdx: number) => {
                      const orderID = order.order_ID || (order as any).orderId;
                      const canCancel = canUserCancelOrder(order.status);
                      const canRefund = canUserRequestRefund(order.status);
                      const normalizedStatus = normalizeOrderStatus(order.status);
                      const isCompleted = normalizedStatus === 'completed';
                      const isRefundFlow =
                        normalizedStatus === 'refund_requested' || normalizedStatus === 'refunded';
                      const statusLabel = getOrderStatusLabel(normalizedStatus, order.status);
                      return (
                        <motion.div
                          key={orderID}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: orderIdx * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          style={{ background: T.surfaceLow }}
                          className="rounded-2xl overflow-hidden"
                        >
                        {/* Order header */}
                        <div
                          style={{
                            background: T.surfaceLowest,
                            borderBottom: `1px solid ${T.onSurface}08`,
                          }}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              style={{
                                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                                color: T.surfaceLowest,
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.6rem',
                                letterSpacing: '0.12em',
                                borderRadius: '4px',
                                padding: '2px 6px',
                              }}
                            >
                              {t('profile.orders.favoriteBadge')}
                            </span>
                            <span
                              style={{
                                color: T.onSurface,
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.875rem',
                              }}
                            >
                              {t('profile.orders.storeName')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              style={{
                                color: isRefundFlow ? '#fb7185' : isCompleted ? '#4ade80' : T.gold,
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em',
                              }}
                            >
                              {statusLabel}
                            </span>
                            <span
                              style={{
                                color: T.onSurfaceVariant,
                                fontSize: '0.75rem',
                                opacity: 0.6,
                              }}
                            >
                              #{orderID}
                            </span>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="px-6 py-5">
                          <div
                            style={{
                              background: T.surfaceLowest,
                              borderRadius: '0.75rem',
                              padding: '0.75rem',
                            }}
                          >
                            <OrderItemsSummary
                              orderId={orderID}
                              busyRowKey={buyAgainRowKey}
                              onBuyAgainItem={a => void handleBuyAgainOneItem(a)}
                              onViewProduct={pid => navigate(`/products/${pid}`)}
                              onContactSeller={() => navigate('/contacts')}
                            />
                          </div>
                        </div>

                        {/* Order footer */}
                        <div
                          style={{
                            background: T.surfaceLowest,
                            borderTop: `1px solid ${T.onSurface}08`,
                          }}
                          className="px-6 py-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3"
                        >
                          <span style={{ color: T.onSurfaceVariant, fontSize: '0.75rem', opacity: 0.6 }}>
                            {canCancel ? t('profile.orders.footerHintCancel') : t('profile.orders.footerHintRefund')}
                            {!canCancel && (
                              <>
                                {' '}
                                {canRefund ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleRequestRefund(order)}
                                    disabled={refundBusyOrderId === Number(orderID)}
                                    style={{
                                      color: refundBusyOrderId === Number(orderID) ? T.onSurfaceVariant : T.gold,
                                      opacity: refundBusyOrderId === Number(orderID) ? 0.75 : 1,
                                    }}
                                    className="hover:underline cursor-pointer font-medium disabled:cursor-not-allowed"
                                  >
                                    {refundBusyOrderId === Number(orderID)
                                      ? t('profile.orders.requestRefundLoading')
                                      : t('profile.orders.requestRefund')}
                                  </button>
                                ) : (
                                  <button style={{ color: T.gold }} className="hover:underline font-medium">
                                    {t('profile.orders.requestReturn')}
                                  </button>
                                )}
                              </>
                            )}
                          </span>
                          <div className="flex items-center gap-3">
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => void handleCancelOrder(order)}
                                style={{
                                  border: `1px solid ${T.onSurface}20`,
                                  color: '#ef4444',
                                  background: 'transparent',
                                  borderRadius: '0.6rem',
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                                className="hover:opacity-80 transition-opacity"
                              >
                                {t('profile.orders.cancelOrder')}
                              </button>
                            )}
                            <Wallet size={18} style={{ color: T.gold }} />
                            <span style={{ color: T.onSurfaceVariant, fontSize: '0.82rem' }}>
                              {t('profile.orders.subtotalLabel')}:
                            </span>
                            <span
                              style={{
                                fontFamily: "'Manrope', sans-serif",
                                color: T.gold,
                                fontWeight: 800,
                                fontSize: '1.25rem',
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {formatPrice(Number(order.total_Amount))}
                            </span>
                          </div>
                        </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Menu grid (visible on profile tab) ──────────────────── */}
          {currentTab === 'profile' && (
            <div style={{ background: T.surfaceLow }} className="rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3
                  style={{
                    color: T.onSurface,
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('profile.wallet.historyTitle')}
                </h3>
                <button
                  type="button"
                  style={{ color: T.gold, fontSize: '0.75rem' }}
                  className="hover:underline"
                  onClick={() => void fetchWallet()}
                  disabled={isWalletApiDisabled}
                >
                  {t('common.refresh')}
                </button>
              </div>
              {walletTransactions.length === 0 ? (
                <p style={{ color: T.onSurfaceVariant, fontSize: '0.8rem', opacity: 0.8 }}>
                  {isWalletApiDisabled ? t('profile.wallet.apiNotAvailableHint') : t('profile.wallet.noTransactions')}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {walletTransactions.slice(0, 20).map((tx, idx) => (
                    <div
                      key={String(tx.id ?? idx)}
                      style={{ background: T.surfaceLowest }}
                      className="rounded-xl px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <p style={{ color: T.onSurface, fontSize: '0.78rem', fontWeight: 600 }}>
                          {getWalletTransactionLabel(
                            String(tx.type || ''),
                            walletTransactionLabels,
                          )}
                        </p>
                        <p style={{ color: T.onSurfaceVariant, fontSize: '0.72rem' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString(walletDateLocale) : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          style={{
                            color: String(tx.type || '').toUpperCase() === 'SPEND' ? '#ef4444' : '#22c55e',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {String(tx.type || '').toUpperCase() === 'SPEND' ? '-' : '+'}
                          {Number(((tx as any).amountCoin ?? tx.amountXu) || 0).toLocaleString(walletDateLocale)}{' '}
                          {t('profile.wallet.coinSuffix')}
                        </p>
                        <p style={{ color: T.onSurfaceVariant, fontSize: '0.72rem' }}>
                          {t('profile.wallet.balanceLabel')}{' '}
                          {Number(((tx as any).balanceCoin ?? tx.balanceAfter) || 0).toLocaleString(walletDateLocale)}{' '}
                          {t('profile.wallet.coinSuffix')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuItems.map((item, i) => (
                <MenuCard
                  key={item.label}
                  index={i}
                  icon={item.icon}
                  title={item.label}
                  description={item.sub}
                  active={activeMenuKey === item.label}
                  onClick={() => {
                    setActiveMenuKey(item.label);
                    item.action();
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Exclusive membership strip ───────────────────────────── */}
          {currentTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: `linear-gradient(135deg, ${T.surfaceLow} 0%, ${T.surfaceHigh} 100%)`,
                borderRadius: '1rem',
                padding: '2.5rem 2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Ambient glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${T.gold}18 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: T.gold,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  marginBottom: '0.5rem',
                  opacity: 0.8,
                }}
              >
                {t('profile.membership.bannerLabel')}
              </p>
              <h3
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  color: T.onSurface,
                  fontWeight: 800,
                  fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                {t('profile.membership.bannerTitle')}
              </h3>
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        title={t('profile.refund.modalTitle')}
        open={Boolean(refundConfirmOrder)}
        centered
        onCancel={() => setRefundConfirmOrder(null)}
        footer={[
          <button
            key="cancel"
            type="button"
            onClick={() => setRefundConfirmOrder(null)}
            className="px-4 py-2 rounded-md bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition-colors"
          >
            {t('common.cancel')}
          </button>,
          <button
            key="confirm"
            type="button"
            onClick={() => {
              if (refundConfirmOrder) void submitRefundRequest(refundConfirmOrder);
              setRefundConfirmOrder(null);
            }}
            className="px-4 py-2 rounded-md bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
          >
            {t('profile.refund.submitRequest')}
          </button>,
        ]}
      >
        <p className="text-sm text-stone-600">{t('profile.refund.confirmMessage')}</p>
      </Modal>

      <Modal
        title={t('profile.wallet.topupModalTitle')}
        open={topupModalOpen}
        destroyOnHidden
        afterOpenChange={(open) => {
          setTopupModalReady(open);
          if (open) {
            topupRenderedRef.current = false;
            setTopupRenderKey((v) => v + 1);
          } else {
            setTopupButtonRendered(false);
          }
        }}
        onCancel={() => {
          setTopupModalOpen(false);
          topupRenderedRef.current = false;
          setTopupButtonRendered(false);
        }}
        footer={null}
      >
        <div className="pt-2 space-y-3">
          <div className="text-sm text-stone-600">{t('profile.wallet.topupInputHint')}</div>
          <InputNumber
            min={1000}
            step={1000}
            value={topupXu}
            onChange={(v) => setTopupXu(Number(v || 0))}
            style={{ width: '100%' }}
          />
          <div className="text-xs text-stone-500">
            {t('profile.wallet.paypalEstimate', { amount: topupAmountUSD })}
          </div>
          {topupSdkLoading && (
            <div className="text-center py-2">
              <Spin />
            </div>
          )}
          {topupError && <div className="text-sm text-red-500">{topupError}</div>}
          {!topupSdkLoading && !topupButtonRendered && (
            <button
              type="button"
              className="text-sm text-blue-500 hover:underline"
              onClick={() => {
                setTopupError('');
                topupRenderedRef.current = false;
                setTopupRenderKey((v) => v + 1);
                void loadTopupPaypalScript();
              }}
            >
              {t('profile.wallet.reloadPaypalButton')}
            </button>
          )}
          {!topupBusy && <div ref={topupPaypalRef} />}
          {topupBusy && (
            <div className="text-center py-2 text-sm text-stone-600">
              {t('profile.wallet.processingPayment')}
            </div>
          )}
        </div>
      </Modal>

      {/* Always-mounted file input so avatar click works on any tab */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleAvatarChange}
        className="hidden"
        accept="image/*"
      />
    </motion.div>
  );
};

export default ProfilePage;
