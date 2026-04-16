import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';
import ShopLayout from '@/layouts/ShopLayout';
import AuthGuard from '@/app/router/AuthGuard';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'));
const BlogPage = lazy(() => import('@/pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

const ProductsPage = lazy(() => import('@/pages/store/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/store/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/store/CartPage'));
const OrderPage = lazy(() => import('@/pages/store/OrderPage'));
const ProfilePage = lazy(() => import('@/pages/store/ProfilePage'));
const WishlistPage = lazy(() => import('@/pages/store/WishlistPage'));

const ProductPage = lazy(() => import('@/pages/shop/ProductPage'));

const AppRoutes = () => (
  <Routes>
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

      <Route element={<AuthGuard />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profiles/:userid" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/carts" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;

