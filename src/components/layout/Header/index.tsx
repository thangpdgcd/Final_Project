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
              transition={{ duration: 0.3 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#121212] border-l border-stone-200 dark:border-stone-800 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/50 bg-stone-50/50 dark:bg-[#121212]/50">
                <h2 className="text-xl md:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tighter uppercase">
                  {t('cart.title')}
                </h2>
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)} 
                  className="p-2 rounded-full bg-stone-100 dark:bg-stone-800/50 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <X size={20} className="text-stone-600 dark:text-stone-300" />
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col pt-6">
                {cartItems.length > 0 ? (
                  <div className="w-full h-full flex flex-col">
                    <motion.div 
                      layout 
                      className="w-full overflow-y-auto space-y-4 pr-2 flex-1 scrollbar-hide"
                    >
                      <AnimatePresence initial={false}>
                        {cartItems.map((item, idx) => {
                          const img = item?.products?.image;
                          const imageSrc = getImageSrc(img);
                          const linePrice =
                            Number(item.quantity || 0) *
                            Number(item.products?.price ?? item.price ?? 0);
                          return (
                            <motion.div
                              layout
                              key={item.cartitem_ID || idx}
                              initial={{ opacity: 0, x: 50, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              transition={{ type: "spring", stiffness: 400, damping: 30, delay: idx * 0.05 }}
                              whileHover={{ y: -2, scale: 1.01 }}
                              className="w-full rounded-2xl border border-stone-100 dark:border-white/5 bg-white dark:bg-white/5 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-black/20 flex-shrink-0">
                                <img
                                  src={imageSrc}
                                  alt={item.products?.name || "cart-product"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/no-image.png";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate mb-1">
                                  {item.products?.name || `Product #${item.product_ID}`}
                                </div>
                                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                                  Qty: <span className="text-stone-700 dark:text-stone-300">{item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-sm font-black text-stone-900 dark:text-white whitespace-nowrap">
                                {linePrice.toLocaleString()} ₫
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800/50 space-y-4"
                    >
                      <div className="w-full rounded-2xl bg-stone-50 dark:bg-white/5 p-4 flex items-center justify-between border border-stone-100 dark:border-white/5">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                          Total
                        </span>
                        <span className="text-base font-black text-stone-900 dark:text-white mt-[2px]">
                          {cartTotal.toLocaleString()} ₫
                        </span>
                      </div>

                      <div className="text-center pt-2">
                        <p className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-4">
                          {t('cart.itemsCount', { count: cartCount })}
                        </p>
                        <motion.button 
                          whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setIsCartOpen(false); navigate('/cart'); }} 
                          className="w-full py-4 rounded-xl bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 font-black tracking-widest text-sm hover:opacity-90 transition-opacity shadow-lg"
                        >
                          {t('cart.viewFullBasket')}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-6 text-center"
                  >
                    <motion.div 
                      animate={{ y: [0, -10, 0] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 bg-stone-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-stone-200 dark:border-white/10"
                    >
                      <ShoppingCart size={40} className="text-stone-300 dark:text-stone-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2 uppercase tracking-tight">
                        {t('cart.emptyTitle')}
                      </h3>
                      <p className="text-stone-500 dark:text-stone-400 text-sm max-w-[240px] leading-relaxed mx-auto">
                        {t('cart.emptyDesc')}
                      </p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setIsCartOpen(false); navigate('/products'); }} 
                      className="px-8 py-3 rounded-full border-2 border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-black text-xs uppercase tracking-widest hover:bg-stone-900 dark:hover:bg-stone-100 hover:text-white dark:hover:text-stone-900 transition-colors mt-4"
                    >
                      {t('cart.shopNow')}
                    </motion.button>
                  </motion.div>
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

