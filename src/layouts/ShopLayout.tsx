import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/shop/navigation/Header';
import ShopProviders from '@/app/providers/ShopProviders';

const ShopLayout: React.FC = () => (
  <ShopProviders>
    <div className="about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
      <Header />
      <Suspense
        fallback={
          <div className="relative z-[1] grid min-h-[60vh] place-items-center">
            <motion.div
              className="h-10 w-10 rounded-full border-2 border-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)] border-t-[color:var(--hl-primary)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        }
      >
        <div className="relative z-[1]">
          <Outlet />
        </div>
      </Suspense>
    </div>
  </ShopProviders>
);

export default ShopLayout;

