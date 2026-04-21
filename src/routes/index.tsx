import { lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CustomerLayout from '@/components/layout/customerlayouts/CustomerLayout';
import ShopLayout from '@/components/layout/shoplayouts/ShopLayout';
import RequireAuth from '@/routes/guards/RequireAuth';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'));
const BlogPage = lazy(() => import('@/pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const OrderPage = lazy(() => import('@/pages/order/OrderPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/storeshope/ProfilePage'));
const VoucherVaultPage = lazy(() => import('@/pages/storeshope/VoucherVaultPage'));

const ProductPage = lazy(() => import('@/pages/shop/ProductPage'));

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<ShopLayout />}>
          <Route path="/shop" element={<ProductPage />} />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactPage />} />
          <Route path="/support" element={<Navigate to="/contacts" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profiles/:userid" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/carts" element={<CartPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            {/* Voucher Vault — uses auth context user_ID to fetch customer's vouchers */}
            <Route path="/vouchers" element={<VoucherVaultPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
