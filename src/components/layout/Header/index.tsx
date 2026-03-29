import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/store/ThemeContext';
import { useAuth } from '@/store/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/translates/i18n';
import Logo from '@/components/common/Logo';
import UserMenu from './UserMenu';
import { getImageSrc } from '@/utils/image';

// --- CONSTANTS ---
const NAV_ITEMS = [
  { label: 'nav.home', href: '/' },
  { label: 'nav.coffee', href: '/products' },
  { label: 'nav.about', href: '/about' },
  { label: 'nav.contact', href: '/contacts' },
];

// --- COMPONENTS ---

/**
 * IconButton: Reusable premium icon button with consistent styling and micro-interactions
 */
const IconButton = React.forwardRef<HTMLButtonElement, {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  className?: string;
  active?: boolean;
  cartTarget?: boolean;
  bounceBadge?: boolean;
}>(({ icon, onClick, badge, className = "", active = false, cartTarget = false, bounceBadge = false }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    data-cart-target={cartTarget ? 'header' : undefined}
    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-[2.5px] transition-all duration-300 group
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900
      ${active
        ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
        : 'border-transparent bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-orange-600 dark:hover:text-orange-400'
      } ${className}`}
  >
    {badge !== undefined && (
      <motion.span
        animate={bounceBadge ? { scale: [1, 1.26, 1] } : undefined}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[var(--coffee-brown)] border-2 border-white dark:border-[#1c1716]"
      >
        {badge}
      </motion.span>
    )}
    {icon}
  </motion.button>
));

const HeaderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggleDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const effectiveUserId = useMemo(() => {
    if (user?.user_ID) return Number(user.user_ID);
    const rawId = localStorage.getItem('user_ID');
    const parsed = Number(rawId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return undefined;
  }, [user]);
  const { data: cartItems = [] } = useCart(effectiveUserId);

  // UI State
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);

  // Scroll Tracking
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const productLastScrollTop = useRef(0);
  const isVisibleRef = useRef(isVisible);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? "down" : "up";
    if (latest > 100 && direction === "down" && isVisible) {
      setIsVisible(false);
    } else if (direction === "up" && !isVisible) {
      setIsVisible(true);
    }
    setIsScrolled(latest > 20);
    lastScrollY.current = latest;
  });

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onCartAdded = () => {
      setCartBadgePulse(true);
      window.setTimeout(() => setCartBadgePulse(false), 380);
    };
    window.addEventListener('cart:item-added', onCartAdded);
    return () => window.removeEventListener('cart:item-added', onCartAdded);
  }, []);

  // Some pages (ex: products) scroll inside their own container.
  // In that case `useScroll()` (window-based) won't update `isScrolled`,
  // so the header background "won't change color" while scrolling.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.product-page');
    if (!el) return;

    productLastScrollTop.current = el.scrollTop;

    const onScroll = () => {
      const top = el.scrollTop;
      const direction = top > productLastScrollTop.current ? 'down' : 'up';

      // Match the same behavior as the window scroll handler above.
      if (top > 100 && direction === 'down' && isVisibleRef.current) {
        setIsVisible(false);
      } else if (direction === 'up') {
        setIsVisible(true);
      }

      setIsScrolled(top > 20);
      productLastScrollTop.current = top;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init state immediately

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [location.pathname]);

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.products?.price ?? item.price ?? 0),
    0,
  );

  const headerClass = isScrolled
    ? 'h-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md shadow-md border-b border-stone-200 dark:border-stone-800'
    : 'h-24 bg-white/30 dark:bg-[#121212]/30 backdrop-blur-sm border-b border-transparent dark:border-transparent';

  const navTextClass =
    '!text-stone-800 dark:!text-stone-200 hover:!text-orange-600 dark:hover:!text-orange-400 transition-colors';

  const iconIdleClass = '';

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-300 overflow-visible ${headerClass}`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">

          {/* Logo Section (Left) */}
          <Link to="/" className="flex-shrink-0 min-w-0">
            <Logo size={42} />
          </Link>

          {/* Navigation Menu (Center) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 ml-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-xs font-bold uppercase tracking-[0.2em] relative group ${navTextClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream)]`}
              >
                {t(item.label)}
                <motion.span
                  className="absolute -bottom-2 left-0 h-0.5 bg-[var(--gold)]"
                  initial={false}
                  animate={{
                    width: location.pathname === item.href ? '100%' : '0%',
                  }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            ))}
          </nav>

          {/* Right-side Icons */}
          <div className="flex items-center gap-4">
            <IconButton
              icon={<Search size={18} />}
              onClick={() => navigate('/products')}
              className={`hidden sm:flex cursor-pointer ${iconIdleClass}`}
            />

            <IconButton
              icon={<ShoppingCart size={18} />}
              badge={cartCount}
              onClick={() => setIsCartOpen(true)}
              cartTarget
              bounceBadge={cartBadgePulse}
              className={`hidden sm:flex cursor-pointer ${iconIdleClass}`}
            />

            <IconButton
              icon={dark ? <Sun size={18} /> : <Moon size={18} />}
              onClick={toggleDark}
              className={`hidden sm:flex cursor-pointer ${iconIdleClass}`}
            />

            {/* Language Toggle */}
            <IconButton
              icon={
                <span className="text-[10px] font-bold">
                  {i18n.language === "vi" ? t("common.lang.en") : t("common.lang.vi")}
                </span>
              }
              onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
              className={`hidden sm:flex cursor-pointer ${iconIdleClass}`}
            />

            {/* User Account - REFINED COMPONENT */}
            <UserMenu
              onLoginClick={() =>
                navigate('/login', { state: { from: location }, replace: false })
              }
            />

            <IconButton
              icon={isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            />
          </div>
        </div>

        {/* mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-[#1e1e1e] shadow-2xl lg:hidden overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <div className="p-6 space-y-4 shadow-inner">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors group"
                  >
                    <span className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest text-sm">{t(item.label)}</span>
                    <ChevronRight size={18} className="text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => setIsCartOpen(true)} className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-bold text-xs uppercase tracking-widest">
                    <ShoppingCart size={16} /> {t('nav.cart')}
                  </button>
                  <button onClick={toggleDark} className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800">
                    {dark ? <Sun size={16} /> : <Moon size={16} />} {t('common.theme')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#121212] border-l border-stone-200 dark:border-stone-800 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
                <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tighter uppercase">{t('cart.title')}</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  <X size={24} className="text-stone-500 dark:text-stone-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
                {cartItems.length > 0 ? (
                  <div className="w-full space-y-5">
                    <div className="w-full max-h-[56vh] overflow-y-auto space-y-3 pr-1">
                      {cartItems.map((item) => {
                        const img = item?.products?.image;
                        const imageSrc = getImageSrc(img);
                        const linePrice =
                          Number(item.quantity || 0) *
                          Number(item.products?.price ?? item.price ?? 0);
                        return (
                          <div
                            key={item.cartitem_ID}
                            className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1e1e1e] p-3 flex items-center gap-3"
                          >
                            <img
                              src={imageSrc}
                              alt={item.products?.name || "cart-product"}
                              className="h-14 w-14 rounded-xl object-cover bg-white"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/no-image.png";
                              }}
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
                                {item.products?.name || `Product #${item.product_ID}`}
                              </div>
                              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div className="text-xs font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap">
                              {linePrice.toLocaleString()} ₫
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full rounded-2xl bg-stone-100 dark:bg-[#1e1e1e] p-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Total
                      </span>
                      <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                        {cartTotal.toLocaleString()} ₫
                      </span>
                    </div>

                    <p className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">
                      {t('cart.itemsCount', { count: cartCount })}
                    </p>
                    <button onClick={() => navigate('/cart')} className="w-full py-5 rounded-2xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-black tracking-[0.2em] text-sm hover:opacity-90 transition-all active:scale-95 shadow-md">
                      {t('cart.viewFullBasket')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-stone-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto">
                      <ShoppingCart size={32} className="text-stone-400 dark:text-stone-500" />
                    </div>
                    <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">{t('cart.emptyTitle')}</h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm max-w-[240px] leading-relaxed mx-auto">{t('cart.emptyDesc')}</p>
                    <button onClick={() => { setIsCartOpen(false); navigate('/products'); }} className="px-10 py-4 rounded-full border-2 border-stone-800 dark:border-stone-200 text-stone-800 dark:text-stone-200 font-black text-xs uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-stone-200 hover:text-white dark:hover:text-stone-900 transition-all">
                      {t('cart.shopNow')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
};

export default HeaderPage;

