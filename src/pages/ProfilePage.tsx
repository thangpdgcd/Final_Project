import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Loader2,
  ShoppingBag,
  Bell,
  Ticket,
  Wallet,
} from 'lucide-react';
import { App } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import * as profileApi from '@/api/profileApi';
import { getImageSrc } from '@/utils/image';
import { useOrders } from '@/hooks/useOrders';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ordersService } from '@/features/orders/services/orders.service';
import { useAddToCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import type { Order, Product } from '@/types';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import type { OrderItemRowAction } from '@/components/orders/OrderItemActions';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const OrderItemsSummary: React.FC<{
  orderId: number;
  onBuyAgainItem: (args: OrderItemRowAction) => void;
  onViewProduct: (productId: number) => void;
  onContactSeller: () => void;
  busyRowKey: string | null;
}> = ({ orderId, onBuyAgainItem, onViewProduct, onContactSeller, busyRowKey }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: products = [] } = useProducts();

  const productMap = useMemo(() => {
    const m = new Map<number, Product>();
    for (const p of products) {
      const id = Number((p as any)?.product_ID ?? (p as any)?.productId ?? (p as any)?.id);
      if (Number.isFinite(id) && id > 0) m.set(id, p);
    }
    return m;
  }, [products]);

  useEffect(() => {
    if (!orderId) return;
    
    const fetchItems = async () => {
      try {
        const res = await ordersService.getItemsByOrderId(orderId);
        setItems(res || []);
      } catch (e) {
        console.error("Error fetching order items:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [orderId]);

  const mergedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];

    const getProductId = (raw: any) =>
      Number(raw?.product_ID ?? raw?.productId ?? raw?.products?.product_ID ?? raw?.products?.id);

    const acc = new Map<number, any>();
    const passthrough: any[] = [];

    for (const raw of items) {
      const pid = getProductId(raw);
      const qty = Number(raw?.quantity ?? 0);
      const price = Number(raw?.price ?? 0);

      if (!Number.isFinite(pid) || pid <= 0) {
        passthrough.push(raw);
        continue;
      }

      const prev = acc.get(pid);
      if (!prev) {
        acc.set(pid, {
          ...raw,
          product_ID: pid,
          quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
          price: Number.isFinite(price) && price >= 0 ? price : 0,
        });
        continue;
      }

      const prevQty = Number(prev?.quantity ?? 0);
      acc.set(pid, {
        ...prev,
        quantity: (Number.isFinite(prevQty) && prevQty > 0 ? prevQty : 0) + (Number.isFinite(qty) && qty > 0 ? qty : 1),
        // keep the first non-zero price (if any)
        price:
          Number.isFinite(prev?.price) && Number(prev.price) > 0
            ? prev.price
            : (Number.isFinite(price) && price >= 0 ? price : prev?.price),
      });
    }

    return [...passthrough, ...Array.from(acc.values())];
  }, [items]);

  if (!orderId) return null;
  if (loading) return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="animate-pulse flex gap-4 my-2"
    >
      <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-xl" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-3/4" />
        <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-1/4" />
      </div>
    </motion.div>
  );

  if (!mergedItems.length) return <div className="text-xs text-stone-400 italic py-2">Đang xử lý thông tin sản phẩm...</div>;

  return (
    <motion.div layout className="grid gap-4">
      <AnimatePresence mode="popLayout">
        {mergedItems.map((raw, idx) => (
          <OrderItemCard
            key={String(raw?.orderitem_ID ?? `${orderId}-${idx}`)}
            raw={raw}
            idx={idx}
            orderId={orderId}
            productMap={productMap}
            busyRowKey={busyRowKey}
            onBuyAgainItem={onBuyAgainItem}
            onViewProduct={onViewProduct}
            onContactSeller={onContactSeller}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAddToCart();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buyAgainRowKey, setBuyAgainRowKey] = useState<string | null>(null);

  const resolveUserIdForCart = () =>
    Number(
      user?.user_ID ??
        (typeof window !== 'undefined' ? localStorage.getItem('user_ID') : null),
    );

  const handleBuyAgainOneItem = async (args: OrderItemRowAction) => {
    const resolvedUserId = resolveUserIdForCart();
    if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
      message.warning('Vui lòng đăng nhập lại để mua lại.');
      return;
    }
    if (!Number.isFinite(args.productId) || args.productId <= 0) return;

    try {
      setBuyAgainRowKey(args.rowKey);
      await addToCart.mutateAsync({
        user_ID: resolvedUserId,
        product_ID: args.productId,
        quantity: args.quantity,
        price: args.price,
      });
      message.success('Đã thêm vào giỏ hàng!');
      navigate('/cart');
    } catch (err) {
      console.error(err);
      message.error('Không thể thêm sản phẩm vào giỏ.');
    } finally {
      setBuyAgainRowKey(null);
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTab = searchParams.get('tab') || 'profile';

  const { data: allOrdersRaw, isLoading: ordersLoading } = useOrders();
  const allOrders = useMemo<Order[]>(() => {
    if (Array.isArray(allOrdersRaw)) return allOrdersRaw;
    // In case API returns a wrapped shape
    const v = allOrdersRaw as any;
    if (v && Array.isArray(v.orders)) return v.orders as Order[];
    if (v && Array.isArray(v.data)) return v.data as Order[];
    if (v && Array.isArray(v.result)) return v.result as Order[];
    return [];
  }, [allOrdersRaw]);

  const userOrders = useMemo<Order[]>(() => {
    return allOrders
      .filter((o: Order) => {
        const orderUserId = o.user_ID || (o as any).UserID || (o as any).userId;
        const currentUserId = user?.user_ID;
        return Number(orderUserId) === Number(currentUserId);
      })
      .sort((a: Order, b: Order) => {
        const idA = a.order_ID || (a as any).orderId || 0;
        const idB = b.order_ID || (b as any).orderId || 0;
        return Number(idB) - Number(idA);
      });
  }, [allOrders, user]);

  const orderTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'Pending', label: 'Chờ thanh toán' },
    { key: 'Shipping', label: 'Vận chuyển' },
    { key: 'To Receive', label: 'Chờ giao hàng' },
    { key: 'Completed', label: 'Hoàn thành' },
    { key: 'Cancelled', label: 'Đã hủy' },
    { key: 'Refund', label: 'Trả hàng/Hoàn tiền' },
  ];

  const filteredOrders = useMemo<Order[]>(() => {
    const status = searchParams.get('status') || 'all';
    if (status === 'all') return userOrders;
    return userOrders.filter((o: Order) => String(o.status || '').toLowerCase() === status.toLowerCase());
  }, [userOrders, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setIsLoading(true);
      const res = await profileApi.uploadAvatar(file);
      message.success(t('profile.avatarSuccess') || 'Avatar updated!');
      if (user) login('', { ...user, avatar: res.avatarUrl });
    } catch (error) {
      message.error(t('profile.avatarError') || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const res = await profileApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      message.success(t('profile.updateSuccess') || 'Profile updated!');
      if (user) login('', { ...user, ...res.user });
      setIsEditing(false);
    } catch (error) {
      message.error(t('profile.updateError') || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#fdfbf7] dark:bg-[#0a0a0a] min-h-screen pt-32 pb-20"
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="w-full md:w-72 flex flex-col gap-6">
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex items-center gap-4 p-4 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800"
          >
            <div className="relative group w-14 h-14 rounded-full overflow-hidden border-2 border-amber-100 dark:border-stone-700 bg-white">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={getImageSrc(previewAvatar || user?.avatar)} 
                alt="avatar" 
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <EditOutlined className="text-white text-lg" />
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold truncate text-stone-900 dark:text-stone-100 text-lg">{user?.name}</span>
              <button
                onClick={() => setSearchParams({ tab: 'profile' })}
                className="text-stone-500 text-xs flex items-center gap-1 hover:text-[#6f4e37] text-left transition-colors"
              >
                <EditOutlined style={{ fontSize: 10 }} /> Sửa Hồ Sơ
              </button>
            </div>
          </motion.div>

          <nav className="flex flex-col gap-2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-3 shadow-sm border border-stone-100 dark:border-stone-800">
            {[
              { id: 'profile', icon: <User size={18} />, label: 'Tài Khoản Của Tôi', color: 'text-blue-500' },
              { id: 'orders', icon: <ShoppingBag size={18} />, label: 'Đơn Mua', color: 'text-orange-600' },
              { id: 'notifications', icon: <Bell size={18} />, label: 'Thông Báo', color: 'text-amber-500' },
              { id: 'vouchers', icon: <Ticket size={18} />, label: 'Kho Voucher', color: 'text-red-500' }
            ].map(item => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4, backgroundColor: 'rgba(111, 78, 55, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => ['profile', 'orders'].includes(item.id) ? setSearchParams({ tab: item.id }) : null}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentTab === item.id 
                    ? 'text-[#6f4e37] bg-stone-50 dark:bg-stone-800/50' 
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <span className={item.color}>{item.icon}</span>
                {item.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {currentTab === 'profile' ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-2xl p-8 lg:p-10 border border-stone-100 dark:border-stone-800"
            >
              <div className="border-b border-stone-100 dark:border-stone-800 pb-6 mb-8">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Hồ Sơ Của Tôi</h2>
                <p className="text-stone-500 text-sm mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <span className="sm:w-32 text-stone-500 text-sm font-medium">Tên đăng nhập</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-100">{user?.email?.split('@')[0]}</span>
                  </div>
                  
                  {[
                    { name: 'name', label: 'Tên', value: formData.name },
                    { name: 'phoneNumber', label: 'Số điện thoại', value: formData.phoneNumber },
                    { name: 'address', label: 'Địa chỉ', value: formData.address }
                  ].map(field => (
                    <div key={field.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <span className="sm:w-32 text-stone-500 text-sm font-medium">{field.label}</span>
                      <input
                        name={field.name}
                        disabled={!isEditing}
                        value={field.value}
                        onChange={handleInputChange}
                        className="flex-1 max-w-md border border-stone-200 dark:border-stone-700 bg-transparent px-4 py-3 rounded-xl outline-none focus:border-[#c4963b] focus:ring-4 focus:ring-[#c4963b]/10 transition-all duration-300 disabled:bg-stone-50 dark:disabled:bg-stone-900/40 text-stone-800 dark:text-stone-200"
                      />
                    </div>
                  ))}

                  <div className="flex items-center gap-6 pt-6">
                    <div className="hidden sm:block sm:w-32" />
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(111, 78, 55, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#6f4e37] to-[#4e3524] text-white px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading && <Loader2 size={18} className="animate-spin" />}
                      {isEditing ? 'Lưu Thay Đổi' : 'Sửa Hồ Sơ'}
                    </motion.button>
                  </div>
                </div>

                <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-stone-800 pt-8 lg:pt-0 flex flex-col items-center gap-6 lg:px-8">
                  <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-stone-50 dark:border-stone-800 shadow-lg">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={getImageSrc(previewAvatar)} 
                      alt="avatar" 
                      className="w-full h-full object-cover transition-transform duration-500" 
                    />
                    <div 
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <EditOutlined className="text-white text-2xl mb-1" />
                      <span className="text-white text-xs font-medium">Thay đổi</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-stone-200 dark:border-stone-700 px-6 py-2 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:border-[#6f4e37] hover:text-[#6f4e37] dark:hover:border-amber-500 dark:hover:text-amber-500 transition-colors"
                  >
                    Chọn Ảnh
                  </motion.button>
                  <p className="text-xs text-stone-400 text-center leading-relaxed">
                    Dung lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG
                  </p>
                  <input ref={fileInputRef} type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-[#1e1e1e] shadow-sm rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800">
                <div className="flex items-center overflow-x-auto scroller-hidden px-2">
                  {orderTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSearchParams({ tab: 'orders', status: tab.key })}
                      className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center transition-colors border-b-2 whitespace-nowrap ${
                        (searchParams.get('status') || 'all') === tab.key
                          ? 'text-[#6f4e37] border-[#6f4e37]'
                          : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-[#6f4e37]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {ordersLoading ? (
                  <div className="bg-white dark:bg-[#1e1e1e] p-12 text-center rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
                    <Loader2 className="animate-spin mx-auto text-[#6f4e37]" size={32} />
                    <p className="mt-4 text-stone-500">Đang tải đơn hàng...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white dark:bg-[#1e1e1e] p-20 text-center rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={48} className="text-stone-300 dark:text-stone-700" />
                    </div>
                    <p className="text-lg font-medium text-stone-800 dark:text-stone-200 mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-stone-500 text-sm">Hãy khám phá các sản phẩm cà phê tuyệt vời của chúng tôi.</p>
                    <Link to="/products" className="mt-6 inline-block bg-[#6f4e37] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#4e3524] transition-colors">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  filteredOrders.map((order: Order, orderIdx: number) => {
                    const orderID = order.order_ID || (order as any).orderId;
                    return (
                      <motion.div
                        key={orderID}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: orderIdx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1e1e1e] shadow-sm rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800"
                      >
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/20">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#6f4e37] text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">Yêu thích</span>
                            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 max-w-[150px] sm:max-w-none truncate">Phan Coffee Official</span>
                            <button className="hidden sm:block border-2 border-[#6f4e37] text-[#6f4e37] text-xs font-semibold px-3 py-1 rounded-full hover:bg-[#6f4e37] hover:text-white transition-colors">Chat</button>
                            <Link to="/products" className="hidden sm:block text-stone-500 text-xs border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">Xem Shop</Link>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 items-end sm:items-center">
                            <span className={`text-xs uppercase tracking-wider font-bold sm:border-r sm:pr-4 ${String(order.status).toLowerCase() === 'completed' ? 'text-green-600' : 'text-[#6f4e37]'} border-stone-200 dark:border-stone-700`}>
                              {String(order.status).toLowerCase() === 'completed' ? 'ĐÃ GIAO HÀNG' : (order.status || 'CHỜ XÁC NHẬN')}
                            </span>
                            <span className="text-stone-500 text-xs font-medium">ID đơn: <span className="text-stone-700 dark:text-stone-300">#{orderID}</span></span>
                          </div>
                        </div>

                        <div className="px-6 pt-6 pb-5">
                          <div className="rounded-xl border border-stone-100 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-[#141414]">
                            <OrderItemsSummary
                              orderId={orderID}
                              busyRowKey={buyAgainRowKey}
                              onBuyAgainItem={(a) => {
                                void handleBuyAgainOneItem(a);
                              }}
                              onViewProduct={(productId) => navigate(`/products/${productId}`)}
                              onContactSeller={() => navigate('/contacts')}
                            />
                          </div>
                        </div>

                        <div className="bg-[#fdfbf7] dark:bg-stone-900/40 px-6 py-5 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                           <span className="text-xs text-stone-400">Không nhận được hàng? <button className="text-[#6f4e37] hover:underline font-medium">Yêu cầu trả hàng</button></span>
                           <div className="flex items-center gap-3">
                            <Wallet className="text-[#6f4e37]" size={20} />
                            <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Thành tiền:</span>
                            <span className="text-2xl font-bold tabular-nums text-[#6f4e37]">{formatPrice(Number(order.total_Amount))}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
