import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  App,
  Button,
  Skeleton,
  Alert,
  Radio,
  Select,
  Rate,
  Tag,
  Avatar,
  Carousel,
  InputNumber
} from 'antd';
import {
  ShoppingCart,
  ArrowLeft,
  Heart,
  CheckCircle,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  Leaf,
  Globe,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/store/AuthContext';
import { useTranslation } from 'react-i18next';
import { getImageSrc } from '@/utils/image';
import { toast } from 'react-toastify';



const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const ProductDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: product, isLoading, error } = useProduct(Number(id));
  const addToCart = useAddToCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();

  // --- UI STATE ---
  const [purchaseType, setPurchaseType] = useState<'once' | 'subscribe'>('once');
  const [grind, setGrind] = useState('Beans');
  const [roast, setRoast] = useState('Medium');
  const [frequency, setFrequency] = useState('Every 2 weeks');
  const [quantity, setQuantity] = useState(1);

  // --- CALCULATIONS ---
  const [billingCycle, _setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const discountRate = purchaseType === 'subscribe' ? (billingCycle === 'yearly' ? 0.25 : 0.15) : 0;
  const basePrice = product?.price || 0;
  const finalPrice = basePrice * (1 - discountRate) * quantity;
  const savings = basePrice * discountRate * quantity;

  const handleCTA = () => {
    if (!user?.user_ID) {
      toast.warning('Vui lòng đăng nhập', { toastId: 'require-login' });
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!product) return;

    addToCart.mutate(
      {
        user_ID: user.user_ID,
        product_ID: product.product_ID,
        quantity,
        price: finalPrice / quantity
      },
      {
        onSuccess: () =>
          {
            message.success(t('productDetail.purchaseOnceSuccess'));
            navigate('/cart');
          },
        onError: () => message.error(t('productDetail.purchaseError')),
      },
    );
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.product_ID)) {
      removeFromWishlist(product.product_ID);
      message.success(t('productDetail.favoriteRemovedSuccess'));
    } else {
      addToWishlist(product);
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 bg-[#FFF9F3] min-h-screen"><Skeleton active avatar paragraph={{ rows: 10 }} /></div>;
  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 bg-[#FFF9F3] min-h-screen">
      <Alert type="error" message={t('productDetail.notFoundMessage')} showIcon />
      <Button className="mt-6" onClick={() => navigate('/products')}>
        {t('productDetail.backToStore')}
      </Button>
    </div>
  );

  const isFavorited = isInWishlist(product.product_ID);

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#4e3524] font-sans pb-32 transition-all duration-500">
      {/* Dynamic Nav Placeholder */}
      <nav className="sticky top-0 z-50 bg-[#FFF9F3]/90 backdrop-blur-xl border-b border-[#6f4e37]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/products')} className="group flex items-center text-[#6f4e37] font-black uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('productDetail.store')}
          </button>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6f4e37] opacity-40 hidden md:block">
              {t('productDetail.artOfCoffee')}
            </div>
          <button onClick={toggleWishlist} className={`p-2 rounded-full transition-all ${isFavorited ? 'bg-red-50 text-red-500 shadow-md' : 'hover:bg-amber-50'}`}>
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* --- LEFT: GALLERY & STORY --- */}
        <div className="lg:col-span-7 space-y-20">

          {/* Visual Experience */}
          <section className="relative group">
            <div className="absolute top-8 left-8 z-10 flex flex-col gap-3 pointer-events-none">
              <span className="px-5 py-2 bg-[#6f4e37] text-white text-[10px] font-black tracking-[0.2em] rounded-full shadow-xl">
                {t('productDetail.badgeBestSeller')}
              </span>
              <span className="px-5 py-2 bg-white/90 backdrop-blur text-orange-600 text-[10px] font-black tracking-[0.2em] rounded-full shadow-lg border border-orange-100">
                {t('productDetail.badgeLimitedEdition')}
              </span>
            </div>

            <div className="rounded-[50px] overflow-hidden bg-white shadow-2xl border-8 border-white group-hover:shadow-[0_40px_80px_-20px_rgba(111,78,55,0.2)] transition-shadow duration-700">
              <Carousel autoplay effect="fade" dotPosition="bottom" className="detail-carousel">
                <div className="aspect-[4/5] md:aspect-square flex items-center justify-center bg-white">
                  <img src={getImageSrc(product.image)} alt={product.name} className="w-full h-full object-cover transform scale-90 group-hover:scale-100 transition-transform duration-1000" />
                </div>
                <div className="aspect-[4/5] md:aspect-square">
                  <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
                </div>
              </Carousel>
            </div>
          </section>

          {/* Storytelling: Origin */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[60px] p-10 md:p-16 shadow-sm border border-[#6f4e37]/5 relative"
          >
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-600 mb-8 flex items-center gap-4">
                <div className="w-8 h-px bg-orange-200"></div> From Farm to Cup
              </h2>
              <h3 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1]" style={{ fontFamily: 'serif' }}>
                Hành trình từ cao nguyên Di Linh
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 italic font-medium">
                "Mỗi hạt cà phê là lời kể của đất bazan và những giọt sương mai trên đỉnh núi cao 1,500m."
              </p>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Globe className="text-[#6f4e37] w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Xuất xứ</div>
                    <div className="font-bold">Lâm Đồng, VN</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Leaf className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Quy trình</div>
                    <div className="font-bold">Sơ chế Ướt</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-[#FFF9F3] rounded-[30px] border border-[#6f4e37]/5">
                <Avatar size={64} className="bg-[#6f4e37]">P</Avatar>
                <div>
                  <div className="font-bold text-lg">Nông dân Phan</div>
                  <div className="text-xs text-orange-600 font-bold uppercase tracking-widest">Hợp tác xã Cao Nguyên</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Plan Components */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, t: 'Giao hàng Ưu tiên', d: 'Xử lý trong 24h' },
              { icon: ShieldCheck, t: 'Cam kết Chất lượng', d: '100% Nguyên chất' },
              { icon: Calendar, t: 'Linh hoạt', d: 'Hủy gói bất kỳ lúc nào' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-[#6f4e37]/5 shadow-sm text-center">
                <item.icon className="w-10 h-10 mx-auto mb-4 text-[#6f4e37]" />
                <div className="font-black text-sm uppercase mb-2">{item.t}</div>
                <div className="text-xs text-gray-400 font-medium">{item.d}</div>
              </div>
            ))}
          </section>

          {/* Social Proof: Reviews */}
          <section className="space-y-10">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black">Phản hồi khách hàng</h2>
              <span className="text-sm font-bold text-[#6f4e37] flex items-center">
                4.9/5 Average <ChevronRight size={16} />
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { u: 'Tùng Nguyễn', c: 'Cà phê rất thơm, vị đậm đà đúng gu mình. Gói đăng ký định kỳ rất tiện lợi!', r: 5 },
                { u: 'Hạnh Lê', c: 'Bao bì xịn xò, quả thực là món quà tuyệt vời cho người yêu cà phê.', r: 5 }
              ].map((rev, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="bg-orange-100 text-orange-700 font-bold" size="large">{rev.u[0]}</Avatar>
                    <div>
                      <div className="font-bold text-sm tracking-tight">{rev.u}</div>
                      <Tag color="success" className="text-[8px] font-black border-none rounded-full px-2">VERIFIED BUYER</Tag>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic mb-6 flex-1">"{rev.c}"</p>
                  <Rate disabled defaultValue={rev.r} className="text-[#6f4e37] text-xs" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- RIGHT: CONVERSION WIDGET --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 space-y-8">

            <div className="bg-white rounded-[50px] p-10 shadow-[0_50px_100px_-20px_rgba(111,78,55,0.15)] border-4 border-white">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-black mb-3 leading-tight">{product.name}</h1>
                <div className="flex items-center justify-center gap-3">
                  <Rate disabled defaultValue={5} className="text-[#6f4e37] text-sm" />
                  <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">{`1.2k+ Đã trải nghiệm`}</span>
                </div>
              </div>

              {/* Purchase Model Toggle */}
              <div className="space-y-4 mb-10">
                <div
                  onClick={() => setPurchaseType('subscribe')}
                  className={`p-6 rounded-[30px] border-2 transition-all cursor-pointer relative group ${purchaseType === 'subscribe' ? 'border-[#6f4e37] bg-amber-50/30' : 'border-gray-100 hover:border-amber-200'}`}
                >
                  {purchaseType === 'subscribe' && (
                    <div className="absolute top-0 right-8 translate-y-[-50%] bg-[#6f4e37] text-white px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest z-10">
                      KHUYÊN DÙNG
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg">Đăng ký Định kỳ</div>
                      <div className="text-xs text-green-600 font-bold">Tiết kiệm {billingCycle === 'yearly' ? '25%' : '15%'} mỗi kỳ</div>
                    </div>
                    <Radio checked={purchaseType === 'subscribe'} />
                  </div>
                  <AnimatePresence>
                    {purchaseType === 'subscribe' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-[#6f4e37]/10 text-[11px] space-y-2 font-medium overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-gray-600"><CheckCircle size={14} className="text-green-500" /> Miễn phí vận chuyển tận nhà</div>
                        <div className="flex items-center gap-2 text-gray-600"><CheckCircle size={14} className="text-green-500" /> Nhận ưu đãi cho lô hàng mới nhất</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  onClick={() => setPurchaseType('once')}
                  className={`p-6 rounded-[30px] border-2 transition-all cursor-pointer ${purchaseType === 'once' ? 'border-[#6f4e37] bg-amber-50/30' : 'border-gray-100 hover:border-amber-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold">Mua một lần</div>
                    <Radio checked={purchaseType === 'once'} />
                  </div>
                </div>
              </div>

              {/* Customization Details */}
              <div className="space-y-6 mb-10 bg-[#FFF9F3]/50 p-6 rounded-[35px]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">Cách pha</label>
                    <Select value={grind} onChange={setGrind} className="w-full shadow-none custom-select" size="large">
                      <Select.Option value="Beans">Nguyên hạt</Select.Option>
                      <Select.Option value="Ground">Xay sẵn</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">Độ rang</label>
                    <Select value={roast} onChange={setRoast} className="w-full custom-select" size="large">
                      <Select.Option value="Light">Rang Sáng</Select.Option>
                      <Select.Option value="Medium">Rang Vừa</Select.Option>
                      <Select.Option value="Dark">Rang Đậm</Select.Option>
                    </Select>
                  </div>
                </div>

                {purchaseType === 'subscribe' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-40">Chu kỳ giao</label>
                    <Select value={frequency} onChange={setFrequency} className="w-full custom-select" size="large">
                      <Select.Option value="Every week">Hàng tuần</Select.Option>
                      <Select.Option value="Every 2 weeks">Mỗi 2 tuần</Select.Option>
                      <Select.Option value="Monthly">Hàng tháng</Select.Option>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Số lượng</label>
                  <InputNumber min={1} value={quantity} onChange={(v) => setQuantity(v || 1)} size="large" className="w-24 border-none bg-white rounded-xl shadow-inner font-black" />
                </div>
              </div>

              {/* Price & Final CTA */}
              <div className="pt-8 border-t border-gray-100">
                {/* --- PRICE DISPLAY --- */}
                <div className="flex items-end justify-between mb-8 px-2">
                  <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Tổng thanh toán</div>
                  <div className="text-right">
                    {savings > 0 && <div className="text-xs text-green-600 font-black mb-1">Gói giúp bạn tiết kiệm {formatPrice(savings)}</div>}
                    <div className="text-4xl font-black text-[#6f4e37]">{formatPrice(finalPrice)}</div>
                  </div>
                </div>

                <Button
                  block
                  size="large"
                  type="primary"
                  className="h-24 rounded-[25px] bg-[#6f4e37] border-none text-xl font-black tracking-tighter hover:bg-[#4e3524] transition-all shadow-2xl shadow-brown-200/50"
                  icon={<ShoppingCart className="w-6 h-6 mr-2" />}
                  onClick={handleCTA}
                >
                  MUA NGAY
                </Button>
              </div>
            </div>

            {/* Urgency & Trust Widgets */}
            <div className="space-y-4">
              <div className="bg-red-50/50 p-6 rounded-[35px] border border-red-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center relative">
                  <Package className="text-red-500 w-6 h-6" />
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <div className="text-sm font-bold text-red-800">Cơ hội cuối! Chỉ còn {product.stock} gói trong đợt rang này.</div>
              </div>

              <div className="bg-green-50/50 p-6 rounded-[35px] border border-green-100 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <Avatar key={i} size="small" className="border-2 border-white" src={`https://i.pravatar.cc/100?u=${i}`} />)}
                </div>
                <div className="text-xs font-bold text-green-800 tracking-tight">Cùng 1,200+ khách hàng đang sử dụng gói định kỳ.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t border-gray-100 z-[100] flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div>
          <div className="text-[10px] font-black uppercase text-gray-400">Thanh toán</div>
          <div className="text-2xl font-black text-[#6f4e37]">{formatPrice(finalPrice)}</div>
        </div>
        <Button
          type="primary"
          size="large"
          className="bg-[#6f4e37] border-none h-16 px-10 rounded-2xl font-black text-xs"
          onClick={handleCTA}
        >
          MUA NGAY
        </Button>
      </div>

    </div>
  );
};

export default ProductDetailPage;

