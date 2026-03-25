import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingCart, 
  Heart, 
  Package, 
  Coffee, 
  Star,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { App } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/hooks/useWishlist';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/store/AuthContext';
import { getImageSrc } from '@/utils/image';

// Utility for image source and price formatting


const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND', 
    maximumFractionDigits: 0 
  }).format(v || 0);

const WishlistItem: React.FC<{ product: any; onRemove: (id: number, e: any) => void; onAdd: (p: any, e: any) => void }> = ({ product, onRemove, onAdd }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-[#1c1716] rounded-[32px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_rgba(75,54,33,0.15)] transition-all duration-500 group border border-[#4B3621]/5 flex flex-col h-full"
    >
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => navigate(`/products/${product.product_ID}`)}
      >
        <img 
          src={getImageSrc(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4B3621]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <button
          onClick={(e) => onRemove(product.product_ID, e)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 transform scale-0 group-hover:scale-100"
        >
          <Trash2 size={18} />
        </button>

        <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 backdrop-saturate-150">
           <div className="flex items-center gap-1 text-[#FFD700]">
             {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
           </div>
           <p className="text-[8px] text-white font-black uppercase tracking-[0.2em] mt-1">
             {t("wishlist.premiumGrade")}
           </p>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 bg-white dark:bg-[#1c1716]">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {product.stock > 0 ? t("wishlist.inStock") : t("wishlist.limited")}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#FFD700]/10 text-[#4B3621] text-[10px] font-black uppercase tracking-widest">
            {t("wishlist.bestSeller")}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-[#4B3621] dark:text-amber-100 mb-6 line-clamp-2 leading-none tracking-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4B3621]/40 font-bold uppercase tracking-widest mb-1">
              {t("wishlist.premiumPrice")}
            </span>
            <span className="text-2xl font-black text-[#4B3621] dark:text-[#FFD700] tracking-tighter leading-none">
              {formatPrice(Number(product.price))}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onAdd(product, e)}
            className="w-14 h-14 bg-[#4B3621] text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-[#4B3621]/30 hover:bg-[#FFD700] hover:text-[#4B3621] transition-all duration-300"
          >
            <ShoppingCart size={22} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistPage: React.FC = () => {
  const { message } = App.useApp();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const { t } = useTranslation();

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.user_ID) {
      navigate('/login', { state: { from: { pathname: '/wishlist' } } });
      return;
    }
    
    addToCart.mutate(
      { 
        user_ID: user.user_ID, 
        product_ID: product.product_ID, 
        quantity: 1, 
        price: product.price 
      },
      {
        onSuccess: () => message.success(t('wishlist.toast.addToCartSuccess')),
        onError: () => message.error(t('wishlist.toast.addToCartError')),
      }
    );
  };

  const handleRemove = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWishlist(productId);
    message.success(t('wishlist.toast.removeSuccess'));
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] dark:bg-[#151211] py-32 px-6 lg:px-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-[#4B3621]/30 dark:text-white/20 text-xs font-black uppercase tracking-[0.4em] mb-6">
              <Link to="/" className="hover:text-[#4B3621] dark:hover:text-white transition-colors">
                {t('wishlist.breadcrumb.origins')}
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#4B3621] dark:text-white">
                {t('wishlist.breadcrumb.treasures')}
              </span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-[#4B3621] dark:text-amber-100 tracking-tighter uppercase leading-[0.8] mb-4 drop-shadow-sm">
              {t('wishlist.savedTitlePrefix')} <br />{" "}
              <span className="text-[#FFD700]">{t('wishlist.savedTitleHighlight')}</span>
            </h1>
            <div className="h-1.5 w-24 bg-[#FFD700] rounded-full" />
          </div>
          
          <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 dark:border-white/10">
            <div className="w-12 h-12 bg-[#4B3621] text-white rounded-2xl flex items-center justify-center font-black text-xl">
              {wishlist.length}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4B3621]/40 dark:text-white/40">
                {t('wishlist.collectionSize')}
              </p>
              <p className="text-sm font-black text-[#4B3621] dark:text-amber-100 uppercase tracking-tighter">
                {t('wishlist.yourSelects')}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="py-32 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-white/5 backdrop-blur-3xl rounded-[80px] border border-white/60 dark:border-white/5 shadow-2xl"
            >
              <div className="relative mb-12">
                <motion.div 
                   animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="w-32 h-32 bg-[#4B3621] text-[#FFD700] rounded-[40px] flex items-center justify-center shadow-[0_30px_60px_rgba(75,54,33,0.3)]"
                >
                  <Heart size={64} fill="currentColor" />
                </motion.div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FFD700] rounded-2xl flex items-center justify-center text-[#4B3621]">
                  <Coffee size={24} />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-[#4B3621] dark:text-amber-100 mb-6 uppercase tracking-tight">
                {t('wishlist.quietCollectionTitle')}
              </h2>
              <p className="text-[#4B3621]/40 dark:text-white/40 font-bold text-lg mb-16 max-w-sm leading-relaxed">
                {t('wishlist.quietCollectionQuote')}
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(75,54,33,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="group flex items-center gap-4 px-14 py-6 bg-[#4B3621] text-white rounded-full font-black uppercase tracking-widest text-xs shadow-xl transition-all"
              >
                {t('wishlist.browseHeritage')}{" "}
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
            >
              {wishlist.map((product) => (
                <WishlistItem 
                  key={product.product_ID} 
                  product={product} 
                  onRemove={handleRemove} 
                  onAdd={handleQuickAdd} 
                />
              ))}
              
              {/* Add item placeholder for empty grid space */}
              <motion.button
                onClick={() => navigate('/products')}
                className="group relative rounded-[32px] border-4 border-dashed border-[#4B3621]/10 dark:border-white/5 flex flex-col items-center justify-center p-12 hover:border-[#4B3621]/30 dark:hover:border-white/20 transition-all min-h-[400px]"
                whileHover={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#4B3621]/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package size={32} className="text-[#4B3621]/20 dark:text-white/20" />
                </div>
                <p className="text-sm font-black text-[#4B3621]/30 dark:text-white/20 uppercase tracking-[0.2em] text-center">
                  {t('wishlist.discoveryNew')}
                  <br />
                  {t('wishlist.breadcrumb.origins')}
                </p>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Story Section */}
        {wishlist.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-40 p-12 md:p-24 rounded-[80px] bg-[#4B3621] text-white overflow-hidden relative shadow-[0_50px_100px_rgba(42,33,30,0.4)]"
          >
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-black/20 rounded-full blur-[100px]" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <div className="w-20 h-20 bg-[#FFD700] rounded-3xl flex items-center justify-center text-[#4B3621] mb-10 shadow-2xl transform -rotate-6">
                  <Coffee size={40} />
                </div>
                <h3 className="text-5xl font-black mb-8 uppercase tracking-tighter leading-tight">Heritage in every <br /> <span className="text-[#FFD700]">Selection.</span></h3>
                <p className="text-amber-100/40 font-bold mb-12 leading-relaxed text-xl max-w-md">
                   "Every bean in your wishlist tells a story of high-altitude harvesting and artisanal roasting from the soul of Kon Tum."
                </p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="group flex items-center gap-3 px-10 py-5 bg-[#FFD700] text-[#4B3621] rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:shadow-[0_20px_40px_rgba(255,215,0,0.3)]"
                >
                  Keep Exploring <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="relative">
                   <div className="w-[300px] h-[400px] bg-white rounded-[40px] shadow-2xl transform rotate-3 overflow-hidden border-[10px] border-white">
                      <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" alt="Coffee" className="w-full h-full object-cover grayscale opacity-80" />
                   </div>
                   <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFD700] rounded-full flex items-center justify-center text-[#4B3621] shadow-2xl animate-pulse">
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Organic</p>
                        <p className="text-xs font-black uppercase leading-none">Highland</p>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
