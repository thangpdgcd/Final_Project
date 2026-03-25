import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Loader2,
  ShoppingBag,
  Bell,
  Ticket,
  Database,
  Wallet,
  Coffee
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

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const OrderItemsSummary: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!orderId) return null;
  if (loading) return (
    <div className="animate-pulse flex gap-4 my-2">
      <div className="w-16 h-16 bg-stone-100 rounded" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-1/4" />
      </div>
    </div>
  );

  if (!items.length) return <div className="text-xs text-stone-400 italic py-2">Đang xử lý thông tin sản phẩm...</div>;

  return (
    <div className="divide-y divide-stone-50 dark:divide-stone-800">
      {items.map((item, idx) => (
        <div key={item.orderitem_ID || idx} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
          <div className="w-20 h-20 bg-stone-50 dark:bg-stone-900 rounded-sm border border-stone-100 dark:border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {item.products?.image ? (
              <img src={getImageSrc(item.products.image)} alt="" className="w-full h-full object-cover" />
            ) : (
              <Coffee className="text-stone-200" size={32} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-stone-800 dark:text-stone-100 font-medium truncate">
              {item.products?.name || `Sản phẩm #${item.product_ID}`}
            </h4>
            <p className="text-stone-400 text-xs mt-1">Phân loại hàng: Mặc định</p>
            <span className="text-sm mt-1 block font-medium text-stone-600 dark:text-stone-400">x{item.quantity}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-stone-400 line-through text-[10px] block opacity-50">{formatPrice(Number(item.price) * 1.2)}</span>
            <span className="text-[#ee4d2d] font-medium text-sm">{formatPrice(Number(item.price))}</span>
          </div>
        </div>
      ))}
    </div>
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

  const handleBuyAgain = async (orderID: number) => {
    if (!orderID) return;
    try {
      setIsLoading(true);
      const items = await ordersService.getItemsByOrderId(orderID);
      
      if (!items || items.length === 0) {
        message.warning("Không tìm thấy sản phẩm để mua lại!");
        return;
      }

      await Promise.all(items.map(item => 
        addToCart.mutateAsync({
          user_ID: user!.user_ID,
          product_ID: item.product_ID,
          quantity: item.quantity,
          price: item.price
        })
      ));

      message.success("Đã thêm sản phẩm vào giỏ hàng!");
      navigate('/cart');
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi mua lại sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTab = searchParams.get('tab') || 'profile';

  const { data: allOrders = [], isLoading: ordersLoading } = useOrders();

  const userOrders = useMemo(() => {
    return allOrders
      .filter(o => {
        const orderUserId = o.user_ID || (o as any).UserID || (o as any).userId;
        const currentUserId = user?.user_ID;
        return Number(orderUserId) === Number(currentUserId);
      })
      .sort((a, b) => {
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

  const filteredOrders = useMemo(() => {
    const status = searchParams.get('status') || 'all';
    if (status === 'all') return userOrders;
    return userOrders.filter(o => String(o.status || '').toLowerCase() === status.toLowerCase());
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
    <div className="bg-[#f5f5f5] dark:bg-[#0a0a0a] min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* SIDEBAR */}
        <div className="w-full md:w-60 flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800 bg-white">
              <img src={getImageSrc(previewAvatar || user?.avatar)} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold truncate text-stone-900 dark:text-stone-100">{user?.name}</span>
              <button
                onClick={() => setSearchParams({ tab: 'profile' })}
                className="text-stone-500 text-xs flex items-center gap-1 hover:text-stone-700 text-left"
              >
                <EditOutlined style={{ fontSize: 10 }} /> Sửa Hồ Sơ
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${currentTab === 'profile' ? 'text-orange-600 font-medium' : 'text-stone-600 dark:text-stone-400 hover:text-orange-600'}`}
            >
              <User size={18} className="text-blue-500" />
              Tài Khoản Của Tôi
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'orders' })}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${currentTab === 'orders' ? 'text-orange-600 font-medium' : 'text-stone-600 dark:text-stone-400 hover:text-orange-600'}`}
            >
              <ShoppingBag size={18} className="text-orange-600" />
              Đơn Mua
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600">
              <Bell size={18} className="text-orange-500" />
              Thông Báo
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600">
              <Ticket size={18} className="text-orange-600" />
              Kho Voucher
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-stone-600 dark:text-stone-400 hover:text-orange-600">
              <Database size={18} className="text-amber-500" />
              Shopee Xu
            </button>
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {currentTab === 'profile' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1e1e1e] shadow-sm rounded-sm p-8"
            >
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4 mb-8">
                <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">Hồ Sơ Của Tôi</h2>
                <p className="text-stone-500 text-sm mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right text-stone-500 text-sm">Tên đăng nhập</span>
                    <span className="font-medium text-stone-800 dark:text-stone-100">{user?.email?.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right text-stone-500 text-sm">Tên</span>
                    <input
                      name="name"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="flex-1 max-w-md border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 rounded-sm outline-none focus:border-stone-400 disabled:bg-stone-50 dark:disabled:bg-stone-900/40"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right text-stone-500 text-sm">Email</span>
                    <span className="text-stone-800 dark:text-stone-100">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right text-stone-500 text-sm">Số điện thoại</span>
                    <input
                      name="phoneNumber"
                      disabled={!isEditing}
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="flex-1 max-w-md border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 rounded-sm outline-none focus:border-stone-400 disabled:bg-stone-50 dark:disabled:bg-stone-900/40"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-right text-stone-500 text-sm">Địa chỉ</span>
                    <input
                      name="address"
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="flex-1 max-w-md border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 rounded-sm outline-none focus:border-stone-400 disabled:bg-stone-50 dark:disabled:bg-stone-900/40"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="w-32" />
                    <button
                      disabled={isLoading}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="bg-[#ee4d2d] text-white px-8 py-2.5 rounded-sm shadow-sm hover:bg-[#d73211] transition-colors font-medium flex items-center gap-2"
                    >
                      {isLoading && <Loader2 size={16} className="animate-spin" />}
                      {isEditing ? 'Lưu' : 'Thay đổi'}
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-72 border-l border-stone-100 dark:border-stone-800 flex flex-col items-center gap-4 px-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border border-stone-100 dark:border-stone-800">
                    <img src={getImageSrc(previewAvatar)} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-sm text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-50 dark:hover:bg-stone-900"
                  >
                    Chọn Ảnh
                  </button>
                  <p className="text-xs text-stone-400 text-center leading-relaxed">
                    Dụng lượng file tối đa 1 MB<br />Định dạng:.JPEG, .PNG
                  </p>
                  <input ref={fileInputRef} type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-[#1e1e1e] shadow-sm rounded-sm overflow-hidden top-[100px] z-20">
                <div className="flex items-center overflow-x-auto scroller-hidden">
                  {orderTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSearchParams({ tab: 'orders', status: tab.key })}
                      className={`flex-1 min-w-[120px] py-4 text-sm text-center transition-colors border-b-2 whitespace-nowrap ${(searchParams.get('status') || 'all') === tab.key
                          ? 'text-[#ee4d2d] border-[#ee4d2d]'
                          : 'text-stone-600 dark:text-stone-400 border-transparent hover:text-[#ee4d2d]'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="bg-white dark:bg-[#1e1e1e] p-12 text-center rounded-sm shadow-sm">
                    <Loader2 className="animate-spin mx-auto text-orange-600" size={32} />
                    <p className="mt-4 text-stone-500">Đang tải đơn hàng...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white dark:bg-[#1e1e1e] p-20 text-center rounded-sm shadow-sm">
                    <div className="w-24 h-24 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={48} className="text-stone-200 dark:text-stone-700" />
                    </div>
                    <p className="text-stone-500">Bạn chưa có đơn hàng nào nè.</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const orderID = order.order_ID || (order as any).orderId;
                    return (
                      <div key={orderID} className="bg-white dark:bg-[#1e1e1e] shadow-sm rounded-sm overflow-hidden border border-stone-100 dark:border-stone-800">
                        <div className="px-6 py-3 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between bg-stone-50/30 dark:bg-stone-900/10">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase">Yêu thích</span>
                            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase">Phan Coffee Official</span>
                            <button className="bg-[#ee4d2d] text-white text-[10px] px-2 py-0.5 rounded-sm hover:opacity-90">Chat</button>
                            <Link to="/products" className="text-stone-500 text-xs border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Xem Shop</Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-[#ee4d2d] font-bold border-r pr-3 border-stone-200 dark:border-stone-800">
                              {String(order.status).toLowerCase() === 'completed' ? 'ĐÃ GIAO' : (order.status || 'CHỜ XÁC NHẬN')}
                            </span>
                            <span className="text-stone-500 text-xs">ID đơn hàng: {orderID}</span>
                          </div>
                        </div>

                        <div className="px-6 pt-6">
                          <OrderItemsSummary orderId={orderID} />
                        </div>

                        <div className="bg-[#fffefb] dark:bg-stone-900/10 px-6 py-4 border-t border-stone-50 dark:border-stone-800 flex flex-col items-end gap-4 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <Wallet className="text-[#ee4d2d]" size={20} />
                            <span className="text-sm text-stone-700 dark:text-stone-300">Thành tiền:</span>
                            <span className="text-2xl font-bold text-[#ee4d2d]">{formatPrice(Number(order.total_Amount))}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap justify-end">
                            <button
                              onClick={() => handleBuyAgain(orderID)}
                              disabled={isLoading}
                              className="bg-[#ee4d2d] text-white px-8 py-2 rounded-sm shadow-sm hover:bg-[#d73211] transition-colors font-medium disabled:opacity-50"
                            >
                              Mua Lại
                            </button>
                            <button className="border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-4 py-2 rounded-sm text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-all">Xem Chi Tiết Đơn Hàng</button>
                            <button className="border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-4 py-2 rounded-sm text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-all">Liên Hệ Người Bán</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
