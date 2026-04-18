import { Suspense } from 'react';
import Header from '@/components/shop/navigation/Header';
import ShopProviders from '@/app/providers/ShopProviders';
import PageSpinner from '@/components/common/PageSpinner';
import AnimatedOutlet from '@/components/common/AnimatedOutlet';

const ShopLayout: React.FC = () => (
  <ShopProviders>
    <div className="about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
      <Header />
      <Suspense
        fallback={
          <PageSpinner />
        }
      >
        <div className="relative z-[1]">
          <AnimatedOutlet />
        </div>
      </Suspense>
    </div>
  </ShopProviders>
);

export default ShopLayout;

