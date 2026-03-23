import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
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
import AuthModal from '@/components/auth/AuthModal';

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
}>(({ icon, onClick, badge, className = "", active = false }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-[2.5px] transition-all duration-300 group
      ${active
        ? 'bg-[#4B3621] border-[#4B3621] text-white'
        : 'bg-transparent border-white hover:bg-white hover:text-[#4B3621] hover:border-white text-white dark:border-white/30 dark:hover:bg-white dark:hover:text-[#4B3621]'
      } ${className}`}
  >
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD700] text-[10px] font-bold text-[#4B3621] border-2 border-white dark:border-[#1c1716]">
        {badge}
      </span>
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
  const { data: cartItems = [] } = useCart(user?.user_ID);

  type RedirectState = { from?: string | { pathname: string; search?: string } };

  const getRedirectPath = (state: RedirectState | null): string => {
    const from = state?.from;
    if (!from) return '/';

    if (typeof from === 'string') {
      return from;
    }

    if (from.pathname) {
      return `${from.pathname}${from.search || ''}`;
    }

    return '/';
  };

  // UI State
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isLoginModalOpen = location.pathname === '/login';

  // Scroll Tracking
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

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
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${isScrolled
            ? 'h-20 bg-[#4B3621]/95 backdrop-blur-md shadow-2xl'
            : 'h-24 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">

          {/* Logo Section (Left) */}
          <Link to="/" className="flex-shrink-0">
            <Logo size={42} className="md:w-[48px]" />
          </Link>

          {/* Navigation Menu (Center) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 ml-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-xs font-bold uppercase tracking-[0.2em] relative group text-white`}
              >
                {t(item.label)}
                <motion.span
                  className="absolute -bottom-2 left-0 h-0.5 bg-[#FFD700]"
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
              icon={<ShoppingCart size={18} />}
              badge={cartCount}
              onClick={() => setIsCartOpen(true)}
              className="hidden sm:flex cursor-pointer"
            />

            <IconButton
              icon={dark ? <Sun size={18} /> : <Moon size={18} />}
              onClick={toggleDark}
              className="hidden sm:flex cursor-pointer"
            />

            {/* Language Toggle */}
            <IconButton
              icon={<span className="text-[10px] font-bold">{i18n.language === 'vi' ? 'EN' : 'VN'}</span>}
              onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
              className="hidden sm:flex cursor-pointer"
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
              className="absolute top-full left-0 right-0 bg-[#4B3621] shadow-2xl lg:hidden overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <span className="font-bold text-white uppercase tracking-widest text-sm">{t(item.label)}</span>
                    <ChevronRight size={18} className="text-[#FFD700] group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => setIsCartOpen(true)} className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white text-[#4B3621] font-bold text-xs uppercase tracking-widest">
                    <ShoppingCart size={16} /> {t('nav.cart')}
                  </button>
                  <button onClick={toggleDark} className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-white/20 text-white font-bold text-xs uppercase tracking-widest">
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FDF5E6] dark:bg-[#1c1716] z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-[#4B3621]/10">
                <h2 className="text-2xl font-black text-[#4B3621] dark:text-amber-100 tracking-tighter uppercase">{t('cart.title')}</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-[#4B3621]/5 transition-colors">
                  <X size={24} className="text-[#4B3621] dark:text-amber-100" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
                {cartItems.length > 0 ? (
                  <div className="w-full space-y-6">
                    <p className="text-[#4B3621]/60 font-bold uppercase tracking-widest text-xs">
                      {t('cart.itemsCount', { count: cartCount })}
                    </p>
                    <button onClick={() => navigate('/carts')} className="w-full py-5 rounded-2xl bg-[#4B3621] text-white font-black tracking-[0.2em] text-sm hover:shadow-xl transition-all active:scale-95">
                      {t('cart.viewFullBasket')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-[#4B3621]/5 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingCart size={32} className="text-[#4B3621]/20" />
                    </div>
                    <h3 className="text-xl font-black text-[#4B3621] dark:text-amber-100">{t('cart.emptyTitle')}</h3>
                    <p className="text-gray-400 text-sm max-w-[240px] leading-relaxed">{t('cart.emptyDesc')}</p>
                    <button onClick={() => { setIsCartOpen(false); navigate('/products'); }} className="px-10 py-4 rounded-full border-2 border-[#4B3621] text-[#4B3621] font-black text-xs uppercase tracking-widest hover:bg-[#4B3621] hover:text-white transition-all">
                      {t('cart.shopNow')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        open={isLoginModalOpen}
        onClose={() => {
          const redirectTo = getRedirectPath(location.state as RedirectState | null);
          // Guard against closing into `/login` again.
          const target = redirectTo === '/login' ? '/' : redirectTo;
          navigate(target, { replace: true });
        }}
      />
    </>
  );
};

export default HeaderPage;

