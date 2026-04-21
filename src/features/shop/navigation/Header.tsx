import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import type { NavItemProps } from '@/types/shop/navigation.types';

const navItems = [
  { label: 'Shop', to: '/shop' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
];

const NavItem = ({ to, label, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'header-nav-link hl-sans relative px-3 py-2 text-sm font-medium tracking-wide transition-colors',
          'text-[color:var(--hl-secondary)] hover:text-[color:var(--hl-primary)]',
          isActive ? 'text-[color:var(--hl-primary)]' : '',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isShopTheme = useMemo(() => {
    return location.pathname.startsWith('/shop') || location.pathname.startsWith('/blog');
  }, [location.pathname]);

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full',
        isShopTheme
          ? 'border-b border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--hl-surface)_88%,transparent)] backdrop-blur-md'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-[color:color-mix(in_srgb,var(--hl-primary-container)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--hl-primary)_10%,transparent)]">
              <span className="text-sm font-semibold text-[color:var(--hl-primary)]">PC</span>
            </div>
            <div className="leading-tight">
              <div
                className="font-semibold tracking-wide text-[color:var(--hl-on-surface)]"
                style={{ fontFamily: 'var(--font-highland-display)' }}
              >
                Phan Coffee
              </div>
              <div className="-mt-0.5 text-[11px] text-[color:color-mix(in_srgb,var(--hl-on-surface)_55%,transparent)]">
                Roast • Brew • Ritual
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => (
              <NavItem key={it.to} {...it} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-lowest)] text-[color:var(--hl-secondary)] transition hover:bg-[color:var(--hl-surface-low)]"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-lowest)] text-[color:var(--hl-secondary)] transition hover:bg-[color:var(--hl-surface-low)]"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-lowest)] text-[color:var(--hl-secondary)] transition hover:bg-[color:var(--hl-surface-low)] md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_28%,transparent)] bg-[color:var(--hl-surface-low)] backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navItems.map((it) => (
                <NavItem key={it.to} {...it} onClick={() => setMobileOpen(false)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
