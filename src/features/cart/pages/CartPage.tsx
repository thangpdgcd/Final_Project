import React, { startTransition, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Alert, Skeleton, Checkbox } from 'antd';
import { ShoppingOutlined, ShopOutlined, CreditCardOutlined, TagOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
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

const { Title } = Typography;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const CartPage: React.FC = () => {
  useDocumentTitle('pages.cart.documentTitle');

  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const userId = useMemo(() => {
    if (user?.user_ID) return Number(user.user_ID);
    const rawId = localStorage.getItem('user_ID');
    const parsedId = Number(rawId);
    if (Number.isFinite(parsedId) && parsedId > 0) return parsedId;
    return undefined;
  }, [user]);

  const { data: cartItems = [], isLoading, error } = useCart(userId);
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();

  const handleRemove = (id: number) => {
    removeItem.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      },
      onError: () => toast.error('Không thể xóa sản phẩm'),
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
    () => selectedItems.reduce((sum, item) => sum + (item.products?.price || item.price || 0) * item.quantity, 0),
    [selectedItems],
  );

  const handleCheckout = () => {
    if (!selectedItems.length) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
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
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
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
        onSuccess: () => toast.success(`Đã thêm ${product.name} vào giỏ hàng`),
        onError: () => toast.error('Thêm vào giỏ hàng thất bại'),
      },
    );
  };

  const recommendedProducts = useMemo(() => {
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 12);
  }, [allProducts]);

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
            Vui lòng đăng nhập
          </h2>
          <p className="hl-sans mt-2 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_70%,transparent)]">
            Đăng nhập để xem và thanh toán giỏ hàng của bạn.
          </p>
          <button
            type="button"
            className="btn-highland-primary mt-8"
            onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
          >
            Đăng nhập ngay
          </button>
        </div>
      </EditorialPageShell>
    );
  }

  if (error)
    return (
      <EditorialPageShell innerClassName="px-5 py-12">
        <div className="mx-auto max-w-4xl">
          <Alert type="error" message="Không thể tải giỏ hàng. Vui lòng thử lại sau." showIcon />
        </div>
      </EditorialPageShell>
    );

  return (
    <EditorialPageShell innerClassName="pb-32">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="hl-sans text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)]">Phan Coffee</p>
          <Title
            level={3}
            className="!m-0 !mt-2 flex items-center gap-2 !font-medium !text-[color:var(--hl-primary)]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            <ShoppingOutlined className="text-[color:var(--hl-primary-container)]" />
            Giỏ hàng
          </Title>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : cartItems.length === 0 ? (
          <div className="contact-form-card rounded-md py-16 text-center shadow-sm">
            <ShoppingOutlined className="mb-4 text-6xl text-[color:color-mix(in_srgb,var(--hl-on-surface)_25%,transparent)]" />
            <p className="hl-sans text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">Giỏ hàng của bạn còn trống</p>
            <button type="button" className="btn-highland-primary mt-6" onClick={() => navigate('/products')}>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="sticky top-20 z-10 flex items-center gap-4 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] px-4 py-4 text-sm font-medium text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)] shadow-sm">
              <div className="flex items-center justify-center w-8">
                <Checkbox
                  checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </div>
              <div className="flex-1 text-stone-800 dark:text-stone-200">Sản Phẩm</div>
              <div className="hidden md:block w-24 text-center">Đơn Giá</div>
              <div className="w-24 md:w-32 text-center">Số Lượng</div>
              <div className="hidden sm:block w-28 text-center">Số Tiền</div>
              <div className="w-16 text-center text-stone-800 dark:text-stone-200">Thao Tác</div>
            </div>

            <div className="overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] shadow-sm">
              <div className="flex items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--hl-outline-variant)_18%,transparent)] px-4 py-3">
                <Checkbox
                  checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">Yêu thích</span>
                <span className="text-sm font-bold ml-1 flex items-center gap-1 cursor-pointer hover:text-orange-600 text-stone-900 dark:text-stone-100">
                  Phan Coffee Official <ShopOutlined />
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
                <div className="flex items-center gap-1 text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
                  <TagOutlined className="text-orange-600" />
                  Voucher giảm đến 20k
                </div>
                <button className="text-blue-500 hover:underline">Xem thêm voucher</button>
              </div>

              <div className="flex items-center gap-2 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_18%,transparent)] bg-[color:color-mix(in_srgb,#16a34a_08%,var(--hl-surface-low))] px-4 py-4 text-xs text-green-700 dark:text-green-400">
                <CreditCardOutlined />
                Giảm 15.000₫ phí vận chuyển đơn tối thiểu 0₫
                <button className="text-blue-500 hover:underline ml-1">Tìm hiểu thêm</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="hl-sans text-base font-semibold uppercase tracking-[0.14em] text-[color:var(--hl-secondary)]">
              Có thể bạn cũng thích
            </h2>
            <button
              className="text-orange-600 text-sm flex items-center gap-1 hover:underline"
              onClick={() => navigate('/products')}
            >
              Xem Tất Cả <span className="text-xs">&gt;</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.product_ID}
                product={product}
                title={product.name}
                description={product.description || ''}
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
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)] bg-[color:var(--hl-surface-lowest)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-stone-800 dark:text-stone-200">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span>Chọn Tất Cả ({cartItems.length})</span>
                </div>
                <button className="hover:text-orange-600 transition-colors" onClick={() => setSelectedIds([])}>
                  Xóa
                </button>
                <button className="hidden sm:block text-orange-600 hover:text-orange-500 transition-colors">Lưu vào mục Đã thích</button>
              </div>

              <div className="flex items-center gap-6 justify-between md:justify-end">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <span className="text-sm">Tổng cộng ({selectedIds.length} sản phẩm):</span>
                    <span className="text-xl font-bold text-orange-600">{formatPrice(totalAmount)}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">Tiết kiệm {formatPrice(totalAmount * 0.1)}</span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  className="bg-orange-600 hover:bg-orange-700 border-none h-12 px-10 font-bold min-w-[200px]"
                  onClick={handleCheckout}
                >
                  Mua Hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbox />
    </EditorialPageShell>
  );
};

export default CartPage;

