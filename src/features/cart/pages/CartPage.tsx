import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Alert, Skeleton, Checkbox } from 'antd';
import { ShoppingOutlined, ShopOutlined, CreditCardOutlined, TagOutlined } from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';
import { useCart, useRemoveCartItem, useUpdateCartItem, useAddToCart } from '../hooks/useCart';
import { useProducts } from '@/features/products';
import type { CartItem as CartItemType, Product } from '@/types';
import Chatbox from '@/components/chatbox';
import EditorialPageShell from '@/components/layout/EditorialPageShell';
import CartItem from '../components/CartItem';
import { ProductCard } from '@/features/products';
import { getImageSrc } from '@/utils/image';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';
import { VoucherInput } from '@/features/voucher/components/VoucherInput';
import { VoucherSummary } from '@/features/voucher/components/VoucherSummary';
import { useApplyVoucher } from '@/features/voucher/hooks/useApplyVoucher';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { i18nKeys } from '@/constants/i18nKeys';
import { toastError, toastInfo, toastSuccess, toastWarning } from '@/lib/toast/i18nToast';
import { CartPurchaseBar } from '@/components/ui/cart/CartPurchaseBar';
import { translatedProductDescription, translatedProductName } from '@/utils/productI18n';
import { calcShippingFeeVnd } from '@/utils/shippingFee';
import { useShipping } from '@/contexts/ShippingContext';

const { Title } = Typography;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v || 0);

const CartPage: React.FC = () => {
  useDocumentTitle('pages.cart.documentTitle');
  const { t } = useAppTranslation();

  const navigate = useNavigate();
  useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const userId = useEffectiveUserId();

  const { data: cartItems = [], isLoading, error } = useCart(userId);
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();

  const handleRemove = (id: number) => {
    removeItem.mutate(id, {
      onSuccess: () => {
        toastSuccess(i18nKeys.toast.cart.removeSuccess);
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      },
      onError: () => toastError(i18nKeys.toast.cart.removeError),
    });
  };

  const handleQtyChange = (item: CartItemType, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      handleRemove(item.cartitem_ID);
      return;
    }
    updateItem.mutate({ id: item.cartitem_ID, quantity: newQty });
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(cartItems.map((item) => item.cartitem_ID));
    } else {
      setSelectedIds([]);
    }
  };

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedIds.includes(item.cartitem_ID)),
    [cartItems, selectedIds],
  );

  const totalAmount = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity,
        0,
      ),
    [selectedItems],
  );

  const voucher = useApplyVoucher();
  const shippingCtx = useShipping();
  const shippingFee = useMemo(
    () => calcShippingFeeVnd(totalAmount, shippingCtx.shippingMethod),
    [totalAmount, shippingCtx.shippingMethod],
  );
  const orderValue = totalAmount + shippingFee;
  const payable = voucher.isSuccess && voucher.finalPrice != null ? voucher.finalPrice : orderValue;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('voucher')?.trim() ?? '';
      const fromStorage = localStorage.getItem('checkout_voucher_code')?.trim() ?? '';
      const code = (fromQuery || fromStorage).trim();
      if (!code) return;
      voucher.setCode(code);
      localStorage.removeItem('checkout_voucher_code');
    } catch {
      // ignore
    }
  }, [voucher]);

  const handleCheckout = () => {
    if (!selectedItems.length) {
      toastWarning(i18nKeys.toast.cart.checkoutNeedSelection);
      return;
    }
    startTransition(() => {
      navigate('/orders', { state: { cartItems: selectedItems } });
    });
  };

  const { data: allProducts = [] } = useProducts();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (product: Product) => {
    if (!userId) {
      toastInfo(i18nKeys.toast.cart.loginToAdd);
      navigate('/login');
      return;
    }
    addToCartMutation.mutate(
      {
        user_ID: userId,
        product_ID: product.product_ID,
        quantity: 1,
        price: product.price,
      },
      {
        onSuccess: () =>
          toastSuccess(i18nKeys.toast.cart.addSuccess, { name: translatedProductName(t, product) }),
        onError: () => toastError(i18nKeys.toast.cart.addError),
      },
    );
  };

  const recommendedProducts = useMemo(() => {
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 12);
  }, [allProducts]);

  const allSelected = selectedIds.length === cartItems.length && cartItems.length > 0;

  if (!userId) {
    return (
      <EditorialPageShell innerClassName="flex min-h-[50vh] flex-col items-center justify-center px-5 py-24 text-center">
        <div className="contact-form-card max-w-md rounded-md p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--hl-surface-low)] text-[color:var(--hl-primary)]">
            <ShoppingOutlined className="text-3xl" />
          </div>
          <h2
            className="mt-6 text-2xl font-medium text-[color:var(--hl-primary)]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {t('customersCart.loginTitle')}
          </h2>
          <p className="hl-sans mt-2 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_70%,transparent)]">
            {t('customersCart.loginSubtitle')}
          </p>
          <button
            type="button"
            className="btn-highland-primary mt-8"
            onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
          >
            {t('customersCart.loginCta')}
          </button>
        </div>
      </EditorialPageShell>
    );
  }

  if (error)
    return (
      <EditorialPageShell innerClassName="px-5 py-12">
        <div className="mx-auto max-w-4xl">
          <Alert type="error" message={t('customersCart.loadErrorDetail')} showIcon />
        </div>
      </EditorialPageShell>
    );

  return (
    <EditorialPageShell innerClassName="pb-32">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="hl-sans text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)]">
            {t('customersCart.eyebrow')}
          </p>
          <Title
            level={3}
            className="!m-0 !mt-2 flex items-center gap-2 !font-medium !text-[color:var(--hl-primary)]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            <ShoppingOutlined className="text-[color:var(--hl-primary-container)]" />
            {t('customersCart.pageHeading')}
          </Title>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : cartItems.length === 0 ? (
          <div className="contact-form-card rounded-md py-16 text-center shadow-sm">
            <ShoppingOutlined className="mb-4 text-6xl text-[color:color-mix(in_srgb,var(--hl-on-surface)_25%,transparent)]" />
            <p className="hl-sans text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">
              {t('customersCart.emptyTitle')}
            </p>
            <button
              type="button"
              className="btn-highland-primary mt-6"
              onClick={() => navigate('/products')}
            >
              {t('customersCart.emptyCta')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              style={{ background: 'var(--hl-surface-lowest)' }}
              className="sticky top-20 z-10 flex items-center gap-4 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] px-4 py-4 text-sm font-medium text-[color:color-mix(in_srgb,var(--hl-on-surface)_75%,transparent)] shadow-sm dark:text-stone-200"
            >
              <div className="flex w-8 items-center justify-center">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </div>
              <div className="flex-1 text-stone-800 dark:text-stone-100">
                {t('customersCart.columns.product')}
              </div>
              <div className="hidden w-24 text-center md:block">
                {t('customersCart.columns.unitPrice')}
              </div>
              <div className="w-24 text-center md:w-32">{t('customersCart.columns.quantity')}</div>
              <div className="hidden w-28 text-center sm:block">
                {t('customersCart.columns.total')}
              </div>
              <div className="w-16 text-center text-stone-800 dark:text-stone-100">
                {t('customersCart.columns.actions')}
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] shadow-sm">
              <div className="flex items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--hl-outline-variant)_18%,transparent)] px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="ml-2 rounded bg-orange-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {t('customersCart.sellerFavorite')}
                </span>
                <span className="ml-1 flex cursor-pointer items-center gap-1 text-sm font-bold text-stone-900 hover:text-orange-600 dark:text-stone-100">
                  {t('customersCart.storeOfficial')} <ShopOutlined />
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.cartitem_ID}
                    item={item}
                    selected={selectedIds.includes(item.cartitem_ID)}
                    onSelect={(checked) => handleSelectOne(item.cartitem_ID, checked)}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                    isRemoving={removeItem.isPending}
                  />
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-4 border-t border-dashed border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] px-4 py-4 text-xs">
                <div className="flex items-center gap-1 text-[color:color-mix(in_srgb,var(--hl-on-surface)_70%,transparent)]">
                  <TagOutlined className="text-orange-600" />
                  {t('customersCart.voucherBanner')}
                </div>
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={() => navigate('/vouchers')}
                >
                  {t('customersCart.moreVouchers')}
                </button>
              </div>

              <div className="px-4 pb-4">
                <VoucherInput
                  code={voucher.code}
                  onCodeChange={(v) => voucher.setCode(v)}
                  onApply={(trimmedCode) => {
                    void voucher.applyVoucher({ orderValue, code: trimmedCode });
                  }}
                  isApplying={voucher.isApplying}
                  errorMessage={voucher.errorMessage || undefined}
                  helperText={
                    selectedItems.length === 0 ? t('customersCart.voucherHelperSelect') : undefined
                  }
                />
                <VoucherSummary
                  discount={voucher.discount}
                  finalPrice={voucher.finalPrice}
                  message={voucher.message}
                  isSuccess={voucher.isSuccess}
                  formatPrice={(v) => formatPrice(v)}
                  onClear={() => voucher.reset()}
                />
              </div>

              <div className="flex items-center gap-2 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_18%,transparent)] bg-[color:color-mix(in_srgb,#16a34a_08%,var(--hl-surface-low))] px-4 py-4 text-xs text-green-700 dark:text-green-400">
                <CreditCardOutlined />
                {t('customersCart.shippingBanner')}
                <button
                  type="button"
                  className="ml-2 rounded-md bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-stone-700 shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-white/75"
                  onClick={() =>
                    shippingCtx.setShippingMethod(
                      shippingCtx.shippingMethod === 'express' ? 'standard' : 'express',
                    )
                  }
                >
                  {shippingCtx.shippingMethod === 'express'
                    ? t('checkout.shippingExpress')
                    : t('checkout.shippingStandard')}
                </button>
                <button type="button" className="ml-1 text-blue-500 hover:underline">
                  {t('customersCart.learnMore')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="hl-sans text-base font-semibold uppercase tracking-[0.14em] text-[color:var(--hl-secondary)]">
              {t('customersCart.recommendedHeading')}
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-orange-600 hover:underline"
              onClick={() => navigate('/products')}
            >
              {t('customersCart.recommendedViewAll')} <span className="text-xs">&gt;</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.product_ID}
                product={product}
                title={translatedProductName(t, product)}
                description={translatedProductDescription(t, product, 'list')}
                price={formatPrice(product.price)}
                imageSrc={getImageSrc(product.image)}
                onOpen={() => navigate(`/product-detail/${product.product_ID}`)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      {!isLoading && cartItems.length > 0 && (
        <CartPurchaseBar
          cartCount={cartItems.length}
          selectedCount={selectedIds.length}
          allSelected={allSelected}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds([])}
          totalLabel={t('customersCart.purchaseBar.totalLabel', { count: selectedIds.length })}
          formattedTotal={formatPrice(payable)}
          discountLine={
            voucher.isSuccess && voucher.discount != null ? (
              <span className="text-[10px] text-emerald-200">
                {t('customersCart.purchaseBar.discountApplied', {
                  amount: formatPrice(voucher.discount),
                })}
              </span>
            ) : undefined
          }
          savingsLine={
            !(voucher.isSuccess && voucher.discount != null) ? (
              <span className="text-[10px] text-white/75">
                {t('customersCart.purchaseBar.savingsEstimate', {
                  amount: formatPrice(totalAmount * 0.1),
                })}
              </span>
            ) : undefined
          }
          checkoutLabel={t('customersCart.purchaseBar.checkout')}
          onCheckout={handleCheckout}
          selectAllLabel={t('customersCart.purchaseBar.selectAll', { count: cartItems.length })}
          removeLabel={t('customersCart.purchaseBar.clearSelection')}
          wishlistLabel={t('customersCart.purchaseBar.saveToWishlist')}
        />
      )}

      <Chatbox />
    </EditorialPageShell>
  );
};

export default CartPage;
