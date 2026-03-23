import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Image, Typography, Alert, Skeleton, Space } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/store/AuthContext';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import type { CartItem } from '@/types';
import Chatbox from '@/components/chatbox';

const { Title, Text } = Typography;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const getImageSrc = (img?: string | null): string => {
  if (!img) return '/no-image.png';
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v) || v.startsWith('data:image/')) return v;
  const head = v.slice(0, 12);
  const mime = head.startsWith('/9j/') ? 'image/jpeg' : head.startsWith('iVBOR') ? 'image/png' : 'image/webp';
  return `data:${mime};base64,${v}`;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.user_ID;

  const { data: cartItems = [], isLoading, error } = useCart(userId);
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();

  const total = useMemo(
    () => cartItems.reduce((sum: number, item: CartItem) => sum + (item.products?.price || item.price || 0) * item.quantity, 0),
    [cartItems],
  );

  const handleRemove = (id: number) => {
    removeItem.mutate(id, {
      onSuccess: () => toast.success('Đã xóa sản phẩm khỏi giỏ hàng'),
      onError: () => toast.error('Không thể xóa sản phẩm'),
    });
  };

  const handleQtyChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      handleRemove(item.cartitem_ID);
      return;
    }
    updateItem.mutate({ id: item.cartitem_ID, quantity: newQty });
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      toast.warning('Giỏ hàng của bạn đang trống');
      return;
    }
    navigate('/orders', { state: { cartItems } });
  };

  const columns: ColumnsType<CartItem> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Image
            src={getImageSrc(item.products?.image)}
            alt={item.products?.name || ''}
            width={56}
            height={56}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback="/no-image.png"
          />
          <Text strong>{item.products?.name || `Sản phẩm #${item.product_ID}`}</Text>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_, item) => formatPrice(item.products?.price || item.price || 0),
    },
    {
      title: 'Số lượng',
      key: 'qty',
      render: (_, item) => (
        <Space>
          <button
            className="w-7 h-7 rounded-full border border-[#6f4e37] text-[#6f4e37] hover:bg-[#6f4e37] hover:text-white transition-colors"
            onClick={() => handleQtyChange(item, -1)}
          >−</button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <button
            className="w-7 h-7 rounded-full border border-[#6f4e37] text-[#6f4e37] hover:bg-[#6f4e37] hover:text-white transition-colors"
            onClick={() => handleQtyChange(item, 1)}
          >+</button>
        </Space>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (_, item) => (
        <Text strong style={{ color: '#6f4e37' }}>
          {formatPrice((item.products?.price || item.price || 0) * item.quantity)}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, item) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          loading={removeItem.isPending}
          onClick={() => handleRemove(item.cartitem_ID)}
        />
      ),
    },
  ];

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingOutlined style={{ fontSize: 64, color: '#6f4e37', opacity: 0.4 }} />
        <Title level={3} className="mt-4">Vui lòng đăng nhập</Title>
        <Button
          type="primary"
          size="large"
          style={{ background: '#6f4e37', marginTop: 16 }}
          onClick={() => navigate('/login', { state: { from: { pathname: '/carts' } } })}
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><Alert type="error" message="Không thể tải giỏ hàng" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Title level={2} style={{ fontFamily: 'var(--font-display)', color: '#4e3524' }}>
        🛒 Giỏ hàng của bạn
      </Title>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingOutlined style={{ fontSize: 72, color: '#6f4e37', opacity: 0.3 }} />
          <Title level={4} className="text-gray-400 mt-4">Giỏ hàng trống</Title>
          <Button
            type="primary"
            size="large"
            style={{ background: '#6f4e37', marginTop: 16 }}
            onClick={() => navigate('/products')}
          >
            Khám phá sản phẩm
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={cartItems}
            rowKey="cartitem_ID"
            pagination={false}
            className="mb-8"
          />

          {/* Summary */}
          <div className="flex justify-end">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm">
              <div className="flex justify-between mb-2 text-gray-500">
                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-500">
                <span>Phí vận chuyển</span>
                <span className="text-green-500">Miễn phí</span>
              </div>
              <div className="border-t pt-3 flex justify-between mb-5">
                <Title level={5} style={{ margin: 0 }}>Tổng cộng</Title>
                <Title level={5} style={{ margin: 0, color: '#6f4e37' }}>{formatPrice(total)}</Title>
              </div>
              <Button
                type="primary"
                size="large"
                block
                style={{ background: '#6f4e37', borderColor: '#6f4e37', height: 48, fontSize: 16 }}
                onClick={handleCheckout}
              >
                Thanh toán ngay →
              </Button>
              <Button
                block
                className="mt-2"
                onClick={() => navigate('/products')}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </>
      )}
      <Chatbox />
    </div>
  );
};

export default CartPage;
