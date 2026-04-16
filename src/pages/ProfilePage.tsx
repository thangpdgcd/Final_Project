import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Award,
} from 'lucide-react';
import { ProfileCard, MenuCard } from '@/features/users/components/profile';
import { useTheme } from '@/store/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import * as profileApi from '@/api/profileApi';
import { getImageSrc } from '@/utils/image';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useOrders, ordersService, OrderItemCard, type OrderItemRowAction } from '@/features/orders';
import { useAddToCart } from '@/features/cart';
import { useProducts } from '@/features/products';
import type { Order, Product } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

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
        Đang xử lý thông tin sản phẩm...
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
// Design tokens — dark / light variants
// ---------------------------------------------------------------------------

const DARK_T = {
  bg: '#131313', surfaceLow: '#1c1b1b', surfaceLowest: '#0e0e0e', surfaceHigh: '#2a2a2a',
  onSurface: '#e5e2e1', onSurfaceVariant: '#d1c5b6',
  gold: '#e5c18b', goldDeep: '#c5a370',
  ringColor: '#131313',
};

const LIGHT_T = {
  bg: '#faf8f5', surfaceLow: '#ffffff', surfaceLowest: '#f3f0ea', surfaceHigh: '#ede9e1',
  onSurface: '#1a0a00', onSurfaceVariant: '#5c3d2e',
  gold: '#b8892a', goldDeep: '#9a7020',
  ringColor: '#faf8f5',
};

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAddToCart();

  const { dark, toggleDark } = useTheme();
  const T = dark ? DARK_T : LIGHT_T;

  const [isEditing, setIsEditing] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buyAgainRowKey, setBuyAgainRowKey] = useState<string | null>(null);

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

  // ── Orders ────────────────────────────────────────────────────────────────
  const { data: allOrdersRaw, isLoading: ordersLoading } = useOrders();
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

  const orderTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'Pending', label: 'Chờ thanh toán' },
    { key: 'Shipping', label: 'Vận chuyển' },
    { key: 'To Receive', label: 'Chờ giao hàng' },
    { key: 'Completed', label: 'Hoàn thành' },
    { key: 'Cancelled', label: 'Đã hủy' },
    { key: 'Refund', label: 'Trả hàng/Hoàn tiền' },
  ];

  const filteredOrders = useMemo<Order[]>(() => {
    const status = searchParams.get('status') || 'all';
    if (status === 'all') return userOrders;
    return userOrders.filter(
      (o: Order) => String(o.status || '').toLowerCase() === status.toLowerCase()
    );
  }, [userOrders, searchParams]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resolveUserIdForCart = () =>
    Number(
      user?.user_ID ??
        (typeof window !== 'undefined' ? localStorage.getItem('user_ID') : null)
    );

  const handleBuyAgainOneItem = async (args: OrderItemRowAction) => {
    const resolvedUserId = resolveUserIdForCart();
    if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
      message.warning('Vui lòng đăng nhập lại để mua lại.');
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
      message.success('Đã thêm vào giỏ hàng!');
      navigate('/cart');
    } catch (err) {
      console.error(err);
      message.error('Không thể thêm sản phẩm vào giỏ.');
    } finally {
      setBuyAgainRowKey(null);
    }
  };

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

  // ── Menu grid items ───────────────────────────────────────────────────────
  const menuItems = [
    {
      icon: <User size={20} />,
      label: 'Tài khoản của tôi',
      sub: 'Thông tin cá nhân, bảo mật, và thanh toán',
      action: () => setSearchParams({ tab: 'profile' }),
    },
    {
      icon: <Ticket size={20} />,
      label: 'Kho Voucher',
      sub: 'Lưu trữ các mã ưu đãi đặc quyền của bạn',
      action: () => {},
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Đơn mua',
      sub: 'Theo dõi các đơn hàng đang giao và lịch sử',
      action: () => setSearchParams({ tab: 'orders' }),
    },
    {
      icon: <Settings size={20} />,
      label: 'Cài đặt hệ thống',
      sub: 'Ngôn ngữ, chế độ hiển thị và quyền riêng tư',
      action: () => {},
    },
    {
      icon: <Bell size={20} />,
      label: 'Thông báo',
      sub: 'Cập nhật mới nhất về bộ sưu tập và đơn hàng',
      action: () => {},
    },
    {
      icon: <Headphones size={20} />,
      label: 'Trung tâm trợ giúp',
      sub: 'Liên hệ đội ngũ hỗ trợ 24/7 của chúng tôi',
      action: () => navigate('/support'),
    },
  ];

  // ── Sidebar nav items ─────────────────────────────────────────────────────
  const sideNavItems = [
    { key: 'identity',    icon: <User size={14} />,      label: 'TÀI KHOẢN', tab: 'profile', section: 'identity'   },
    { key: 'orders',      icon: <ShoppingBag size={14} />, label: 'ĐƠN HÀNG', tab: 'orders',  section: null         },
    { key: 'promotions',  icon: <Tag size={14} />,        label: 'PROMOTION', tab: 'profile', section: 'promotions' },
  ];

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
                {user?.name || 'Guest'}
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
                PREMIUM MEMBER
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

          {/* Dark / Light toggle */}
          <div className="px-4 pb-2 flex items-center justify-between">
            <span
              style={{
                color: T.onSurfaceVariant,
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                opacity: 0.6,
              }}
            >
              {dark ? 'DARK MODE' : 'LIGHT MODE'}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              title={dark ? 'Chuyển sang Light' : 'Chuyển sang Dark'}
              style={{
                background: `${T.gold}18`,
                border: `1px solid ${T.gold}30`,
                color: T.gold,
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 300ms ease',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  {dark ? <Sun size={14} /> : <Moon size={14} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Upgrade CTA */}
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                color: T.surfaceLowest,
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                borderRadius: '0.75rem',
                boxShadow: `0 8px 40px -8px ${T.gold}40`,
                transition: 'all 300ms ease-out',
              }}
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <Award size={14} />
              UPGRADE TO GOLD
            </motion.button>
          </div>
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
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: 'ĐƠN HÀNG', value: userOrders.length, icon: <ShoppingBag size={16} /> },
              { label: 'VOUCHER', value: '—', icon: <Ticket size={16} /> },
              { label: 'ĐIỂM', value: '—', icon: <Award size={16} /> },
            ].map(stat => (
              <div
                key={stat.label}
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
                  THÔNG TIN CÁ NHÂN
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
                      TÀI KHOẢN
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
                      EMAIL
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
                    { name: 'name', label: 'HỌ VÀ TÊN', placeholder: 'Nhập họ và tên...' },
                    { name: 'phoneNumber', label: 'SỐ ĐIỆN THOẠI', placeholder: 'Nhập số điện thoại...' },
                    { name: 'address', label: 'ĐỊA CHỈ', placeholder: 'Nhập địa chỉ...' },
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
                      HỦY
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
                    {isEditing ? 'LƯU THAY ĐỔI' : 'CHỈNH SỬA'}
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
                      Đang tải đơn hàng...
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
                      Chưa có đơn hàng nào
                    </p>
                    <p style={{ color: T.onSurfaceVariant, fontSize: '0.82rem', opacity: 0.7 }}>
                      Hãy khám phá các sản phẩm cà phê tuyệt vời của chúng tôi.
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
                      MUA SẮM NGAY
                    </Link>
                  </div>
                ) : (
                  filteredOrders.map((order: Order, orderIdx: number) => {
                    const orderID = order.order_ID || (order as any).orderId;
                    const isCompleted =
                      String(order.status).toLowerCase() === 'completed';
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
                              YÊU THÍCH
                            </span>
                            <span
                              style={{
                                color: T.onSurface,
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.875rem',
                              }}
                            >
                              Phan Coffee Official
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              style={{
                                color: isCompleted ? '#4ade80' : T.gold,
                                fontFamily: "'Manrope', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em',
                              }}
                            >
                              {isCompleted
                                ? 'ĐÃ GIAO HÀNG'
                                : String(order.status || 'CHỜ XÁC NHẬN').toUpperCase()}
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
                            Không nhận được hàng?{' '}
                            <button style={{ color: T.gold }} className="hover:underline font-medium">
                              Yêu cầu trả hàng
                            </button>
                          </span>
                          <div className="flex items-center gap-3">
                            <Wallet size={18} style={{ color: T.gold }} />
                            <span style={{ color: T.onSurfaceVariant, fontSize: '0.82rem' }}>
                              Thành tiền:
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
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Menu grid (visible on profile tab) ──────────────────── */}
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
                EXCLUSIVE MEMBERSHIP
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
                Experience the Extraordinary
              </h3>
            </motion.div>
          )}
        </div>
      </div>

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
