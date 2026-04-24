import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  App,
  Button,
  Skeleton,
  Alert,
  Radio,
  Select,
  Rate,
  Tag,
  Avatar,
  Carousel,
  InputNumber,
} from 'antd';
import {
  ShoppingCart,
  ArrowLeft,
  Heart,
  CheckCircle,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  Leaf,
  Globe,
  ChevronRight,
  Wrench,
  Layers,
  FlaskConical,
  Thermometer,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/categories/useCategories';
import { useAddToCart } from '@/hooks/cart/useCart';
import { useWishlist } from '@/hooks/userwishlists/useWishlist';
import { useAuth } from '@/store/auth/AuthContext';
import { useTheme } from '@/store/themes/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getImageSrc } from '@/utils/images/image';
import { translatedProductDescription, translatedProductName } from '@/utils/products/productI18n';
import { i18nKeys } from '@/translates/constants/i18nKeys';
import { toastWarning } from '@/utils/lib/toast/i18nToast';

const formatPrice = (v: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

// ── Theme tokens (2 product types × 2 brightness modes = 4 variants) ─────────

const COFFEE_LIGHT = {
  pageBg: '#fdfbf8',
  navBg: 'rgba(253,251,248,0.92)',
  navBorder: 'rgba(111,78,55,0.10)',
  cardBg: '#ffffff',
  storyBg: '#ffffff',
  storyBorder: 'rgba(111,78,55,0.05)',
  workshopBg: '#FFF9F3',
  workshopBorder: 'rgba(111,78,55,0.05)',
  featureCardBg: '#ffffff',
  reviewCardBg: '#ffffff',
  panelBg: '#ffffff',
  accent: '#6f4e37',
  accentHover: '#4e3524',
  accentBorder: 'rgba(111,78,55,0.12)',
  bodyColor: '#1a0a00',
  subtleColor: '#5c3d2e',
  tag: 'bg-[#6f4e37] text-white',
  tagAlt: 'bg-white/90 text-orange-600 border border-orange-100',
  optionBox: 'bg-[#FFF9F3]/60',
  badgeSub: 'bg-[#6f4e37] text-white',
  iconColor: 'text-[#6f4e37]',
  priceColor: 'text-[#6f4e37]',
  navText: 'text-[#6f4e37]',
  borderTop: 'border-gray-100',
  stockBg: 'bg-red-50/50 border-red-100',
  stockIcon: 'text-red-500',
  stockText: 'text-red-800',
  stockPing: 'bg-red-500',
  rateClass: 'text-[#6f4e37]',
  sectionLabel: 'text-orange-600',
  dividerBar: 'bg-orange-200',
  cardFeatureIcon: 'bg-amber-50',
  avatarBg: 'bg-[#6f4e37]',
  avatarName: 'text-orange-600',
  reviewBadge: 'success' as const,
  reviewAvatar: 'bg-orange-100 text-orange-700',
  panelShadow: '0 50px 100px -20px rgba(111,78,55,0.18)',
  stockIconBg: '#fee2e2',
};

const COFFEE_DARK = {
  pageBg: '#130800',
  navBg: 'rgba(19,8,0,0.96)',
  navBorder: 'rgba(212,167,106,0.18)',
  cardBg: '#2a1408',
  storyBg: '#2a1408',
  storyBorder: 'rgba(212,167,106,0.08)',
  workshopBg: '#3a1e0a',
  workshopBorder: 'rgba(212,167,106,0.12)',
  featureCardBg: '#2a1408',
  reviewCardBg: '#2a1408',
  panelBg: '#2a1408',
  accent: '#d4a76a',
  accentHover: '#c4925a',
  accentBorder: 'rgba(212,167,106,0.20)',
  bodyColor: '#fde8c8',
  subtleColor: '#c9a882',
  tag: 'bg-[#d4a76a] text-[#130800]',
  tagAlt: 'bg-[#3a1e0a]/90 text-[#d4a76a] border border-[#d4a76a]/30',
  optionBox: 'bg-[#3a1e0a]/60',
  badgeSub: 'bg-[#d4a76a] text-[#130800]',
  iconColor: 'text-[#d4a76a]',
  priceColor: 'text-[#d4a76a]',
  navText: 'text-[#d4a76a]',
  borderTop: 'border-[#3a1e0a]',
  stockBg: 'bg-[#3a1e0a]/60 border-[#d4a76a]/20',
  stockIcon: 'text-[#d4a76a]',
  stockText: 'text-[#fde8c8]',
  stockPing: 'bg-[#d4a76a]',
  rateClass: 'text-[#d4a76a]',
  sectionLabel: 'text-[#d4a76a]',
  dividerBar: 'bg-[#5c3d2e]',
  cardFeatureIcon: 'bg-[#3a1e0a]',
  avatarBg: 'bg-[#d4a76a]',
  avatarName: 'text-[#d4a76a]',
  reviewBadge: 'warning' as const,
  reviewAvatar: 'bg-[#3a1e0a] text-[#d4a76a]',
  panelShadow: '0 50px 100px -20px rgba(212,167,106,0.14)',
  stockIconBg: '#3a1e0a',
};

// Brew-light shares the same warm cream foundation as coffee-light.
// Accent: charcoal-slate #374151 — premium "steel tool" feel, in-brand.
const BREW_LIGHT = {
  pageBg: '#faf8f5',
  navBg: 'rgba(250,248,245,0.92)',
  navBorder: 'rgba(55,65,81,0.10)',
  cardBg: '#ffffff',
  storyBg: '#ffffff',
  storyBorder: 'rgba(55,65,81,0.06)',
  workshopBg: '#f3f2ef',
  workshopBorder: 'rgba(55,65,81,0.08)',
  featureCardBg: '#ffffff',
  reviewCardBg: '#ffffff',
  panelBg: '#ffffff',
  accent: '#374151',
  accentHover: '#1f2937',
  accentBorder: 'rgba(55,65,81,0.14)',
  bodyColor: '#111827',
  subtleColor: '#4b5563',
  tag: 'bg-[#374151] text-white',
  tagAlt: 'bg-white/90 text-gray-600 border border-gray-200',
  optionBox: 'bg-[#f3f2ef]/70',
  badgeSub: 'bg-[#374151] text-white',
  iconColor: 'text-[#374151]',
  priceColor: 'text-[#374151]',
  navText: 'text-[#374151]',
  borderTop: 'border-gray-200',
  stockBg: 'bg-gray-50 border-gray-200',
  stockIcon: 'text-gray-500',
  stockText: 'text-gray-800',
  stockPing: 'bg-gray-500',
  rateClass: 'text-[#374151]',
  sectionLabel: 'text-gray-500',
  dividerBar: 'bg-gray-300',
  cardFeatureIcon: 'bg-gray-100',
  avatarBg: 'bg-[#374151]',
  avatarName: 'text-gray-500',
  reviewBadge: 'default' as const,
  reviewAvatar: 'bg-gray-100 text-gray-700',
  panelShadow: '0 50px 100px -20px rgba(55,65,81,0.14)',
  stockIconBg: '#f3f4f6',
};

// Brew-dark: same deep-espresso canvas as coffee-dark, silver accent for "steel" feel.
const BREW_DARK = {
  pageBg: '#111118',
  navBg: 'rgba(17,17,24,0.96)',
  navBorder: 'rgba(209,213,219,0.12)',
  cardBg: '#1c1c24',
  storyBg: '#1c1c24',
  storyBorder: 'rgba(209,213,219,0.07)',
  workshopBg: '#26262f',
  workshopBorder: 'rgba(209,213,219,0.10)',
  featureCardBg: '#1c1c24',
  reviewCardBg: '#1c1c24',
  panelBg: '#1c1c24',
  accent: '#d1d5db',
  accentHover: '#9ca3af',
  accentBorder: 'rgba(209,213,219,0.18)',
  bodyColor: '#f3f4f6',
  subtleColor: '#9ca3af',
  tag: 'bg-[#d1d5db] text-[#111118]',
  tagAlt: 'bg-[#26262f]/90 text-gray-300 border border-gray-700',
  optionBox: 'bg-[#26262f]/70',
  badgeSub: 'bg-[#d1d5db] text-[#111118]',
  iconColor: 'text-[#d1d5db]',
  priceColor: 'text-[#d1d5db]',
  navText: 'text-[#d1d5db]',
  borderTop: 'border-gray-800',
  stockBg: 'bg-gray-800/50 border-gray-700',
  stockIcon: 'text-gray-400',
  stockText: 'text-gray-200',
  stockPing: 'bg-gray-400',
  rateClass: 'text-[#d1d5db]',
  sectionLabel: 'text-gray-400',
  dividerBar: 'bg-gray-700',
  cardFeatureIcon: 'bg-gray-800',
  avatarBg: 'bg-[#d1d5db]',
  avatarName: 'text-gray-400',
  reviewBadge: 'default' as const,
  reviewAvatar: 'bg-gray-800 text-gray-300',
  panelShadow: '0 50px 100px -20px rgba(209,213,219,0.08)',
  stockIconBg: '#1f2937',
};

// ── Component ─────────────────────────────────────────────────────────────────

const ProductDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: product, isLoading, error } = useProduct(Number(id));
  const { data: categories = [] } = useCategories();
  const addToCart = useAddToCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t, i18n } = useTranslation();
  const { dark, toggleDark } = useTheme();
  const moneyLocale = i18n.language?.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-US';

  const [purchaseType, setPurchaseType] = useState<'once' | 'subscribe'>('once');
  const [grind, setGrind] = useState('Beans');
  const [roast, setRoast] = useState('Medium');
  const [size, setSize] = useState('Standard');
  const [material, setMaterial] = useState('Stainless Steel');
  const [frequency, setFrequency] = useState('Every 2 weeks');
  const [quantity, setQuantity] = useState(1);

  const [billingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const discountRate = purchaseType === 'subscribe' ? (billingCycle === 'yearly' ? 0.25 : 0.15) : 0;
  const basePrice = product?.price || 0;
  const finalPrice = basePrice * (1 - discountRate) * quantity;
  const savings = basePrice * discountRate * quantity;

  // ── Category / theme detection ─────────────────────────────────────────────
  // Detect COFFEE products by category name (Robusta / Arabica / Blend / Specialty).
  // Everything else (Accessories, Stationery, Electronics, Office Tools …) is
  // treated as a non-coffee product and gets the neutral steel theme.
  const COFFEE_CATEGORY_NAMES = new Set([
    'robusta',
    'arabica',
    'blend',
    'specialty',
    'coffee',
    'cà phê',
    'ca phe',
  ]);

  const isCoffeeProduct = useMemo(() => {
    if (!product) return false;
    const catId = (product as any).categories_ID ?? (product as any).category_ID;
    if (catId && categories.length > 0) {
      const cat = categories.find((c: any) => c.category_ID === catId);
      const catName = String(cat?.name ?? '')
        .toLowerCase()
        .trim();
      // Match any of the known coffee category names
      if (COFFEE_CATEGORY_NAMES.has(catName)) return true;
      for (const key of COFFEE_CATEGORY_NAMES) {
        if (catName.includes(key)) return true;
      }
      // If category resolved but is NOT a coffee category → definitely non-coffee
      if (catName) return false;
    }
    // No category info: fallback to product-name keyword heuristic
    const nameStr = String((product as any).name ?? '').toLowerCase();
    return /robusta|arabica|blend|specialty|cà phê|ca phe/i.test(nameStr);
  }, [product, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBrewingTool = !isCoffeeProduct;
  const T = isCoffeeProduct ? (dark ? COFFEE_DARK : COFFEE_LIGHT) : dark ? BREW_DARK : BREW_LIGHT;

  // ── Document title ────────────────────────────────────────────────────────
  const productDisplayName = product ? translatedProductName(t, product) : '';
  const productDescription = product ? translatedProductDescription(t, product, 'detail') : '';

  React.useEffect(() => {
    const prev = document.title;
    if (isLoading) {
      document.title = t('pages.productDetail.loadingDocumentTitle');
    } else if (error || !product) {
      document.title = t('pages.productDetail.notFoundDocumentTitle');
    } else {
      document.title = t('pages.productDetail.documentTitle', { name: productDisplayName });
    }
    return () => {
      document.title = prev;
    };
  }, [isLoading, error, product, t, i18n.language, productDisplayName]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCTA = () => {
    if (!user?.user_ID) {
      toastWarning(i18nKeys.toast.product.loginRequired, undefined, { toastId: 'require-login' });
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!product) return;
    addToCart.mutate(
      {
        user_ID: user.user_ID,
        product_ID: product.product_ID,
        quantity,
        price: finalPrice / quantity,
      },
      {
        onSuccess: () => {
          message.success(t('productDetail.purchaseOnceSuccess'));
          navigate('/cart');
        },
        onError: () => message.error(t('productDetail.purchaseError')),
      },
    );
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.product_ID)) {
      removeFromWishlist(product.product_ID);
      message.success(t('productDetail.favoriteRemovedSuccess'));
    } else {
      addToWishlist(product);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="about-page min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
        <div className="relative z-[1] mx-auto max-w-7xl px-4 py-20">
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  if (error || !product)
    return (
      <div className="about-page min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
        <div className="relative z-[1] mx-auto max-w-7xl px-4 py-20">
          <Alert type="error" message={t('productDetail.notFoundMessage')} showIcon />
          <Button className="mt-6" onClick={() => navigate('/products')}>
            {t('productDetail.backToStore')}
          </Button>
        </div>
      </div>
    );

  const isFavorited = isInWishlist(product.product_ID);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-32 font-sans transition-all duration-500"
      style={{
        background: T.pageBg,
        color: T.bodyColor,
        transition: 'background 0.4s ease, color 0.4s ease',
      }}
    >
      {/* ── Identity banner ─────────────────────────────────────────────── */}
      <div
        className="w-full py-2 text-center text-[10px] font-black uppercase tracking-[0.35em]"
        style={{
          background: isBrewingTool
            ? dark
              ? 'linear-gradient(90deg, #0a0a0f 0%, #111118 40%, #26262f 60%, #111118 80%, #0a0a0f 100%)'
              : 'linear-gradient(90deg, #1f2937 0%, #374151 50%, #1f2937 100%)'
            : dark
              ? 'linear-gradient(90deg, #080400 0%, #130800 40%, #2a1408 60%, #130800 80%, #080400 100%)'
              : 'linear-gradient(90deg, #4e3524 0%, #6f4e37 50%, #4e3524 100%)',
          color: isBrewingTool ? '#e5e7eb' : '#fde8c8',
          letterSpacing: '0.3em',
        }}
      >
        {isBrewingTool
          ? t('productDetail.banner.brewingEquipment')
          : t('productDetail.banner.premiumCoffee')}
      </div>

      <div className="relative z-[1]">
        {/* ── Sticky nav ────────────────────────────────────────────────── */}
        <nav
          className="sticky top-0 z-50 border-b px-6 py-4 backdrop-blur-xl"
          style={{
            background: T.navBg,
            borderColor: T.navBorder,
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/products')}
              className={`group flex items-center font-black uppercase tracking-widest text-xs ${T.navText}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('productDetail.store')}
            </button>
            <div
              className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-35 hidden md:block ${T.navText}`}
            >
              {isBrewingTool ? t('productDetail.precisionCraft') : t('productDetail.artOfCoffee')}
            </div>
            <div className="flex items-center gap-2">
              {/* Dark / Light mode toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleDark}
                title={dark ? t('productDetail.switchToLight') : t('productDetail.switchToDark')}
                className="p-2 rounded-full transition-all"
                style={{
                  background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  color: T.accent,
                  border: `1px solid ${T.accentBorder}`,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={dark ? 'sun' : 'moon'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-full transition-all ${
                  isFavorited ? 'bg-red-50 text-red-500 shadow-md' : 'hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-20">
            {/* Product image carousel */}
            <section className="relative group">
              <div className="absolute top-8 left-8 z-10 flex flex-col gap-3 pointer-events-none">
                <span
                  className={`px-5 py-2 text-[10px] font-black tracking-[0.2em] rounded-full shadow-xl ${T.tag}`}
                >
                  {isBrewingTool ? 'CRAFTSMAN PICK' : t('productDetail.badgeBestSeller')}
                </span>
                <span
                  className={`px-5 py-2 backdrop-blur text-[10px] font-black tracking-[0.2em] rounded-full shadow-lg ${T.tagAlt}`}
                >
                  {isBrewingTool ? 'PROFESSIONAL GRADE' : t('productDetail.badgeLimitedEdition')}
                </span>
              </div>

              <div
                className="rounded-[50px] overflow-hidden bg-white shadow-2xl border-8 border-white transition-shadow duration-700"
                style={{
                  boxShadow: `0 40px 80px -20px ${isBrewingTool ? 'rgba(30,58,95,0.14)' : 'rgba(111,78,55,0.14)'}`,
                }}
              >
                <Carousel autoplay effect="fade" dotPosition="bottom" className="detail-carousel">
                  <div className="aspect-[4/5] md:aspect-square flex items-center justify-center bg-white">
                    <img
                      src={getImageSrc(product.image)}
                      alt={productDisplayName}
                      className="w-full h-full object-cover cursor-pointer transform scale-90 group-hover:scale-100 transition-transform duration-1000"
                    />
                  </div>
                  <div className="aspect-[4/5] md:aspect-square">
                    <img
                      src={
                        isBrewingTool
                          ? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200'
                          : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1200'
                      }
                      alt=""
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </div>
                </Carousel>
              </div>
            </section>

            {/* ── Story / Origin section ─────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[60px] p-10 md:p-16 shadow-sm relative"
              style={{
                background: T.storyBg,
                border: `1px solid ${T.storyBorder}`,
              }}
            >
              <div className="max-w-2xl">
                {isBrewingTool ? (
                  /* ── Brewing tool story ─────────────────────────────── */
                  <>
                    <h2
                      className={`text-[10px] font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-4 ${T.sectionLabel}`}
                    >
                      <div className={`w-8 h-px ${T.dividerBar}`} />
                      Craftsmanship &amp; Precision
                    </h2>
                    <h3
                      className="text-4xl md:text-5xl font-black mb-8 leading-[1.1]"
                      style={{ fontFamily: 'serif' }}
                    >
                      Thiết kế cho những tay pha chế chuyên nghiệp
                    </h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-10 italic font-medium">
                      "Mỗi chi tiết được gia công với độ chính xác cao — từ lỗ lọc đến van điều áp —
                      để cho ra tách cà phê hoàn hảo."
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${T.cardFeatureIcon}`}
                        >
                          <Layers className={`w-6 h-6 ${T.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase">
                            Chất liệu
                          </div>
                          <div className="font-bold">Thép không gỉ 304</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${T.cardFeatureIcon}`}
                        >
                          <Thermometer className={`w-6 h-6 ${T.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase">
                            Nhiệt độ
                          </div>
                          <div className="font-bold">Chịu đến 200°C</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-4 p-6 rounded-[30px]"
                      style={{ background: T.workshopBg, border: `1px solid ${T.workshopBorder}` }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-sky-100 font-black text-xl"
                        style={{ background: '#1e3a5f' }}
                      >
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Phan Coffee Workshop</div>
                        <div
                          className={`text-xs font-bold uppercase tracking-widest ${T.avatarName}`}
                        >
                          Xưởng gia công thủ công
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── Coffee story ─────────────────────────────────────── */
                  <>
                    <h2
                      className={`text-[10px] font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-4 ${T.sectionLabel}`}
                    >
                      <div className={`w-8 h-px ${T.dividerBar}`} />
                      From Farm to Cup
                    </h2>
                    <h3
                      className="text-4xl md:text-5xl font-black mb-8 leading-[1.1]"
                      style={{ fontFamily: 'serif' }}
                    >
                      {t('productDetail.story.title')}
                    </h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-10 italic font-medium">
                      {t('productDetail.story.quote')}
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${T.cardFeatureIcon}`}
                        >
                          <Globe className={`w-6 h-6 ${T.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase">
                            {t('productDetail.story.originLabel')}
                          </div>
                          <div className="font-bold">{t('productDetail.story.originValue')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${T.cardFeatureIcon}`}
                        >
                          <Leaf className="text-green-600 w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase">
                            {t('productDetail.story.processLabel')}
                          </div>
                          <div className="font-bold">{t('productDetail.story.processValue')}</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-4 p-6 rounded-[30px]"
                      style={{ background: T.workshopBg, border: `1px solid ${T.workshopBorder}` }}
                    >
                      <Avatar size={64} className={T.avatarBg}>
                        P
                      </Avatar>
                      <div>
                        <div className="font-bold text-lg">{t('productDetail.story.farmerName')}</div>
                        <div
                          className={`text-xs font-bold uppercase tracking-widest ${T.avatarName}`}
                        >
                          {t('productDetail.story.farmerOrg')}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.section>

            {/* ── Feature badges ────────────────────────────────────────── */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(isBrewingTool
                ? [
                    { icon: Wrench, t: 'Bảo hành 2 năm', d: 'Đổi trả miễn phí' },
                    { icon: ShieldCheck, t: 'Chứng nhận An toàn', d: 'Thép không gỉ 304' },
                    { icon: FlaskConical, t: 'Kiểm định Chất lượng', d: 'Độ chính xác ±0.1mm' },
                  ]
                : [
                    { icon: Truck, t: 'Giao hàng Ưu tiên', d: 'Xử lý trong 24h' },
                    { icon: ShieldCheck, t: 'Cam kết Chất lượng', d: '100% Nguyên chất' },
                    { icon: Calendar, t: 'Linh hoạt', d: 'Hủy gói bất kỳ lúc nào' },
                  ]
              ).map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-[40px] shadow-sm text-center"
                  style={{ background: T.featureCardBg, border: `1px solid ${T.accentBorder}` }}
                >
                  <item.icon className={`w-10 h-10 mx-auto mb-4 ${T.iconColor}`} />
                  <div className="font-black text-sm uppercase mb-2">{item.t}</div>
                  <div className="text-xs text-gray-400 font-medium">{item.d}</div>
                </div>
              ))}
            </section>

            {/* ── Reviews ───────────────────────────────────────────────── */}
            <section className="space-y-10">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black">{t('productDetail.reviews.title')}</h2>
                <span className={`text-sm font-bold flex items-center ${T.iconColor}`}>
                  {t('productDetail.reviews.average', { score: '4.9/5' })}{' '}
                  <ChevronRight size={16} />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(isBrewingTool
                  ? [
                      {
                        u: 'Minh Barista',
                        c: 'Phin lọc rất chuẩn, cà phê nhỏ giọt đều và thơm hơn hẳn. Chất liệu thép dày dặn, bền lắm.',
                        r: 5,
                      },
                      {
                        u: 'Quang Roaster',
                        c: 'Thiết kế tinh tế, không bị rỉ sét sau nhiều tháng sử dụng. Xứng đáng đầu tư cho dụng cụ pha chế.',
                        r: 5,
                      },
                    ]
                  : [
                      {
                        u: 'Tùng Nguyễn',
                        c: 'Cà phê rất thơm, vị đậm đà đúng gu mình. Gói đăng ký định kỳ rất tiện lợi!',
                        r: 5,
                      },
                      {
                        u: 'Hạnh Lê',
                        c: 'Bao bì xịn xò, quả thực là món quà tuyệt vời cho người yêu cà phê.',
                        r: 5,
                      },
                    ]
                ).map((rev, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-[40px] shadow-sm h-full flex flex-col"
                    style={{ background: T.reviewCardBg, border: `1px solid ${T.accentBorder}` }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className={`font-bold ${T.reviewAvatar}`} size="large">
                        {rev.u[0]}
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm tracking-tight">{rev.u}</div>
                        <Tag
                          color={T.reviewBadge}
                          className="text-[8px] font-black border-none rounded-full px-2"
                        >
                          {t('productDetail.reviews.verifiedBuyer')}
                        </Tag>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic mb-6 flex-1">
                      "{rev.c}"
                    </p>
                    <Rate disabled defaultValue={rev.r} className={`text-xs ${T.rateClass}`} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN (sticky purchase panel) ────────────────── */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32 space-y-8">
              <div
                className="rounded-[50px] p-10"
                style={{
                  background: T.panelBg,
                  boxShadow: T.panelShadow,
                  border: `2px solid ${T.accentBorder}`,
                }}
              >
                {/* Product name + rating */}
                <div className="mb-10 text-center">
                  <h1 className="text-4xl font-black mb-3 leading-tight">{productDisplayName}</h1>
                  {productDescription && (
                    <p className="mt-3 text-center text-sm leading-relaxed text-stone-500 max-w-xl mx-auto">
                      {productDescription}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <Rate disabled defaultValue={5} className={`text-sm ${T.rateClass}`} />
                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">
                      {isBrewingTool
                        ? t('productDetail.stats.purchased', { countText: '3.8k+' })
                        : t('productDetail.stats.tried', { countText: '1.2k+' })}
                    </span>
                  </div>
                </div>

                {/* Purchase type selector — coffee only */}
                {!isBrewingTool && (
                  <div className="space-y-4 mb-10">
                    <div
                      onClick={() => setPurchaseType('subscribe')}
                      className={`p-6 rounded-[30px] border-2 transition-all cursor-pointer relative group ${
                        purchaseType === 'subscribe'
                          ? 'border-[#6f4e37] bg-amber-50/30'
                          : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      {purchaseType === 'subscribe' && (
                        <div className="absolute top-0 right-8 translate-y-[-50%] bg-[#6f4e37] text-white px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest z-10">
                          KHUYÊN DÙNG
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-lg">Đăng ký Định kỳ</div>
                          <div className="text-xs text-green-600 font-bold">
                            Tiết kiệm 15% mỗi kỳ
                          </div>
                        </div>
                        <Radio checked={purchaseType === 'subscribe'} />
                      </div>
                      <AnimatePresence>
                        {purchaseType === 'subscribe' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-[#6f4e37]/10 text-[11px] space-y-2 font-medium overflow-hidden"
                          >
                            <div className="flex items-center gap-2 text-gray-600">
                              <CheckCircle size={14} className="text-green-500" /> Miễn phí vận
                              chuyển tận nhà
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <CheckCircle size={14} className="text-green-500" /> Nhận ưu đãi cho
                              lô hàng mới nhất
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      onClick={() => setPurchaseType('once')}
                      className={`p-6 rounded-[30px] border-2 transition-all cursor-pointer ${
                        purchaseType === 'once'
                          ? 'border-[#6f4e37] bg-amber-50/30'
                          : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold">{t('productDetail.purchase.once')}</div>
                        <Radio checked={purchaseType === 'once'} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Options grid — conditional by type */}
                <div className={`space-y-6 mb-10 p-6 rounded-[35px] ${T.optionBox}`}>
                  <div className="grid grid-cols-2 gap-4">
                    {isBrewingTool ? (
                      <>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">
                            {t('productDetail.options.size.label')}
                          </label>
                          <Select value={size} onChange={setSize} className="w-full" size="large">
                            <Select.Option value="Small">{t('productDetail.options.size.small')}</Select.Option>
                            <Select.Option value="Standard">{t('productDetail.options.size.standard')}</Select.Option>
                            <Select.Option value="Large">{t('productDetail.options.size.large')}</Select.Option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">
                            {t('productDetail.options.material.label')}
                          </label>
                          <Select
                            value={material}
                            onChange={setMaterial}
                            className="w-full"
                            size="large"
                          >
                            <Select.Option value="Stainless Steel">
                              {t('productDetail.options.material.stainless')}
                            </Select.Option>
                            <Select.Option value="Aluminum">
                              {t('productDetail.options.material.aluminum')}
                            </Select.Option>
                            <Select.Option value="Titanium">
                              {t('productDetail.options.material.titanium')}
                            </Select.Option>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">
                            {t('productDetail.options.grind.label')}
                          </label>
                          <Select value={grind} onChange={setGrind} className="w-full" size="large">
                            <Select.Option value="Beans">{t('productDetail.options.grind.beans')}</Select.Option>
                            <Select.Option value="Ground">{t('productDetail.options.grind.ground')}</Select.Option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">
                            {t('productDetail.options.roast.label')}
                          </label>
                          <Select value={roast} onChange={setRoast} className="w-full" size="large">
                            <Select.Option value="Light">{t('productDetail.options.roast.light')}</Select.Option>
                            <Select.Option value="Medium">{t('productDetail.options.roast.medium')}</Select.Option>
                            <Select.Option value="Dark">{t('productDetail.options.roast.dark')}</Select.Option>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  {!isBrewingTool && purchaseType === 'subscribe' && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">
                        {t('productDetail.options.frequency.label')}
                      </label>
                      <Select
                        value={frequency}
                        onChange={setFrequency}
                        className="w-full"
                        size="large"
                      >
                        <Select.Option value="Every week">
                          {t('productDetail.options.frequency.weekly')}
                        </Select.Option>
                        <Select.Option value="Every 2 weeks">
                          {t('productDetail.options.frequency.every2Weeks')}
                        </Select.Option>
                        <Select.Option value="Monthly">
                          {t('productDetail.options.frequency.monthly')}
                        </Select.Option>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      {t('productDetail.options.quantity')}
                    </label>
                    <InputNumber
                      min={1}
                      value={quantity}
                      onChange={(v) => setQuantity(v || 1)}
                      size="large"
                      className="w-24 border-none bg-white rounded-xl shadow-inner font-black"
                    />
                  </div>
                </div>

                {/* Price + CTA */}
                <div className={`pt-8 border-t ${T.borderTop}`}>
                  <div className="flex items-end justify-between mb-8 px-2">
                    <div className="text-gray-400 text-xs font-black uppercase tracking-widest">
                      {t('productDetail.totalPayable')}
                    </div>
                    <div className="text-right">
                      {savings > 0 && (
                        <div className="text-xs text-green-600 font-black mb-1">
                          {t('productDetail.savings', { amount: formatPrice(savings, moneyLocale) })}
                        </div>
                      )}
                      <div className={`text-4xl font-black ${T.priceColor}`}>
                        {formatPrice(finalPrice, moneyLocale)}
                      </div>
                    </div>
                  </div>

                  <Button
                    block
                    size="large"
                    type="primary"
                    className="h-24 rounded-[25px] border-none text-xl font-black tracking-tighter shadow-2xl transition-all"
                    style={{ background: T.accent, color: isBrewingTool ? '#0d1b2a' : '#ffffff' }}
                    icon={<ShoppingCart className="w-6 h-6 mr-2" />}
                    onClick={handleCTA}
                  >
                    {t('productDetail.buyNow')}
                  </Button>
                </div>
              </div>

              {/* Stock alert */}
              <div className={`p-6 rounded-[35px] border flex items-center gap-4 ${T.stockBg}`}>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center relative`}
                  style={{ background: T.stockIconBg }}
                >
                  {isBrewingTool ? (
                    <Star className={`w-6 h-6 ${T.stockIcon}`} />
                  ) : (
                    <Package className={`w-6 h-6 ${T.stockIcon}`} />
                  )}
                  <span
                    className={`absolute top-0 right-0 w-3 h-3 rounded-full animate-ping ${T.stockPing}`}
                  />
                </div>
                <div className={`text-sm font-bold ${T.stockText}`}>
                  {isBrewingTool
                    ? t('productDetail.stock.tool', { count: product.stock })
                    : t('productDetail.stock.coffee', { count: product.stock })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDetailPage;
