import React from 'react';
import { App } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Coffee,
  Heart,
  Package,
  ShoppingCart,
  Star,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import EditorialPageShell from '@/components/layout/EditorialPageShell';
import { useAddToCart } from '@/features/cart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/store/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getImageSrc } from '@/utils/image';
import { translatedProductName } from '@/utils/productI18n';

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

type WishlistItemProps = {
  product: any;
  onRemove: (id: number, e: any) => void;
  onAdd: (p: any, e: any) => void;
};

const WishlistItem: React.FC<WishlistItemProps> = ({ product, onRemove, onAdd }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const moneyLocale = i18n.language?.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-US';
  const displayName = translatedProductName(t, {
    product_ID: Number(product.product_ID),
    name: String(product.name ?? ''),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-[#4B3621]/5 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(75,54,33,0.15)] dark:bg-[#1c1716]"
    >
      <div
        className="relative aspect-[3/4] cursor-pointer overflow-hidden"
        onClick={() => navigate(`/products/${product.product_ID}`)}
      >
        <img
          src={getImageSrc(product.image)}
          alt={displayName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4B3621]/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <button
          onClick={(e) => onRemove(product.product_ID, e)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:bg-red-500 group-hover:text-white"
        >
          <Trash2 size={18} />
        </button>

        <div className="absolute bottom-4 left-4 translate-y-4 rounded-2xl border border-white/20 bg-white/10 p-3 opacity-0 backdrop-blur-md backdrop-saturate-150 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-1 text-[#FFD700]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={10} fill="currentColor" />
            ))}
          </div>
          <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-white">
            {t('wishlist.premiumGrade')}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-white p-8 dark:bg-[#1c1716]">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {product.stock > 0 ? t('wishlist.inStock') : t('wishlist.limited')}
          </span>
          <span className="rounded-full bg-[#FFD700]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#4B3621]">
            {t('wishlist.bestSeller')}
          </span>
        </div>

        <h3 className="mb-6 line-clamp-2 text-xl font-black leading-none tracking-tight text-[#4B3621] dark:text-amber-100">
          {displayName}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#4B3621]/40">
              {t('wishlist.premiumPrice')}
            </span>
            <span className="text-2xl font-black leading-none tracking-tighter text-[#4B3621] dark:text-[#FFD700]">
              {formatPrice(Number(product.price), moneyLocale)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onAdd(product, e)}
            className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#4B3621] text-white shadow-2xl shadow-[#4B3621]/30 transition-all duration-300 hover:bg-[#FFD700] hover:text-[#4B3621]"
          >
            <ShoppingCart size={22} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistPage: React.FC = () => {
  useDocumentTitle('pages.wishlist.documentTitle');

  const { message } = App.useApp();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const { t } = useTranslation();

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.user_ID) {
      navigate('/login', { state: { from: { pathname: '/wishlist' } } });
      return;
    }

    addToCart.mutate(
      {
        user_ID: user.user_ID,
        product_ID: product.product_ID,
        quantity: 1,
        price: product.price,
      },
      {
        onSuccess: () => message.success(t('wishlist.toast.addToCartSuccess')),
        onError: () => message.error(t('wishlist.toast.addToCartError')),
      },
    );
  };

  const handleRemove = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWishlist(productId);
    message.success(t('wishlist.toast.removeSuccess'));
  };

  return (
    <EditorialPageShell innerClassName="px-5 py-12 sm:px-8 lg:px-12 lg:py-16 xl:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-10 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="hl-sans mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)]">
              <Link to="/" className="transition-colors hover:text-[color:var(--hl-primary)]">
                {t('wishlist.breadcrumb.origins')}
              </Link>
              <ChevronRight size={14} aria-hidden />
              <span className="text-[color:var(--hl-primary)]">
                {t('wishlist.breadcrumb.treasures')}
              </span>
            </div>
            <h1
              className="mt-3 text-4xl font-medium leading-[1.1] tracking-tight text-[color:var(--hl-primary)] sm:text-5xl lg:text-[3.25rem]"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('wishlist.savedTitlePrefix')}{' '}
              <span className="text-[color:var(--hl-primary-container)]">
                {t('wishlist.savedTitleHighlight')}
              </span>
            </h1>
            <p className="hl-sans mt-4 max-w-md text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">
              {t('wishlist.yourSelects')}
            </p>
          </div>

          <div className="about-glass-card flex items-center gap-4 rounded-md p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[color:color-mix(in_srgb,var(--hl-primary)_12%,transparent)] text-lg font-semibold text-[color:var(--hl-primary)]">
              {wishlist.length}
            </div>
            <div>
              <p className="hl-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--hl-secondary)]">
                {t('wishlist.collectionSize')}
              </p>
              <p className="hl-sans text-sm font-medium text-[color:var(--hl-on-surface)]">
                {t('wishlist.yourSelects')}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col items-center justify-center rounded-[80px] border border-white/60 bg-white/30 py-32 text-center shadow-2xl backdrop-blur-3xl dark:border-white/5 dark:bg-white/5"
            >
              <div className="relative mb-12">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="flex h-32 w-32 items-center justify-center rounded-[40px] bg-[#4B3621] text-[#FFD700] shadow-[0_30px_60px_rgba(75,54,33,0.3)]"
                >
                  <Heart size={64} fill="currentColor" />
                </motion.div>
                <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD700] text-[#4B3621]">
                  <Coffee size={24} />
                </div>
              </div>

              <h2 className="mb-6 text-4xl font-black uppercase tracking-tight text-[#4B3621] dark:text-amber-100 md:text-5xl">
                {t('wishlist.quietCollectionTitle')}
              </h2>
              <p className="mb-16 max-w-sm text-lg font-bold leading-relaxed text-[#4B3621]/40 dark:text-white/40">
                {t('wishlist.quietCollectionQuote')}
              </p>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(75,54,33,0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="group flex items-center gap-4 rounded-full bg-[#4B3621] px-14 py-6 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all"
              >
                {t('wishlist.browseHeritage')}{' '}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {wishlist.map((product) => (
                <WishlistItem
                  key={product.product_ID}
                  product={product}
                  onRemove={handleRemove}
                  onAdd={handleQuickAdd}
                />
              ))}

              <motion.button
                onClick={() => navigate('/products')}
                className="group relative flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border-4 border-dashed border-[#4B3621]/10 p-12 transition-all hover:border-[#4B3621]/30 dark:border-white/5 dark:hover:border-white/20"
                whileHover={{ scale: 0.98 }}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#4B3621]/5 transition-transform group-hover:scale-110 dark:bg-white/5">
                  <Package size={32} className="text-[#4B3621]/20 dark:text-white/20" />
                </div>
                <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-[#4B3621]/30 dark:text-white/20">
                  {t('wishlist.discoveryNew')}
                  <br />
                  {t('wishlist.breadcrumb.origins')}
                </p>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {wishlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mt-40 overflow-hidden rounded-[80px] bg-[#4B3621] p-12 text-white shadow-[0_50px_100px_rgba(42,33,30,0.4)] md:p-24"
          >
            <div className="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-[#FFD700]/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-black/20 blur-[100px]" />

            <div className="relative z-10 flex flex-col items-center gap-16 md:flex-row">
              <div className="w-full md:w-1/2">
                <div className="mb-10 flex h-20 w-20 -rotate-6 items-center justify-center rounded-3xl bg-[#FFD700] text-[#4B3621] shadow-2xl">
                  <Coffee size={40} />
                </div>
                <h3 className="mb-8 text-5xl font-black uppercase leading-tight tracking-tighter">
                  Heritage in every <br /> <span className="text-[#FFD700]">Selection.</span>
                </h3>
                <p className="mb-12 max-w-md text-xl font-bold leading-relaxed text-amber-100/40">
                  “Every bean in your wishlist tells a story of high-altitude harvesting and
                  artisanal roasting from the soul of Kon Tum.”
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="group flex items-center gap-3 rounded-2xl bg-[#FFD700] px-10 py-5 text-xs font-black uppercase tracking-widest text-[#4B3621] transition-all hover:shadow-[0_20px_40px_rgba(255,215,0,0.3)]"
                >
                  Keep Exploring{' '}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="flex w-full justify-center md:w-1/2">
                <div className="relative">
                  <div className="h-[400px] w-[300px] rotate-3 overflow-hidden rounded-[40px] border-[10px] border-white bg-white shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
                      alt="Coffee"
                      className="h-full w-full object-cover grayscale opacity-80"
                    />
                  </div>
                  <div className="absolute -bottom-10 -left-10 flex h-40 w-40 animate-pulse items-center justify-center rounded-full bg-[#FFD700] text-[#4B3621] shadow-2xl">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                        Organic
                      </p>
                      <p className="text-xs font-black uppercase leading-none">Highland</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </EditorialPageShell>
  );
};

export default WishlistPage;
