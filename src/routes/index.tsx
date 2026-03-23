import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';

// ─── Customer pages (lazy-loaded) ─────────────────────────────────────────────
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const OrderPage = lazy(() => import('@/pages/OrderPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));

// ─── Admin pages (lazy-loaded) ────────────────────────────────────────────────
const SystemPage = lazy(() => import('@/pages/system/SystemPage'));

const AppRoutes = () => (
  <Routes>
    {/* ── Customer Layout ── */}
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contacts" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected customer routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profiles/:userid" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>
    </Route>

    {/* ── Admin Layout (protected) ── */}
    <Route element={<ProtectedRoute allowedRoles={['admin', 1]} />}>
      <Route path="/system/*" element={<AdminLayout />}>
        <Route index element={<SystemPage />} />
        <Route path="*" element={<SystemPage />} />
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
