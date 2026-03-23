import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle,
  ShoppingBag, 
  LogOut, 
  ChevronRight,
  ArrowRight,
  User,
  Settings,
  Heart
} from 'lucide-react';

interface DropdownProps {
  isLoggedIn: boolean;
  user?: { name: string; email?: string; avatar?: string } | null;
  onLogout: () => void;
  onClose: () => void;
  onLoginClick: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ isLoggedIn, user, onLogout, onClose, onLoginClick }) => {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { icon: <UserCircle size={18} />, label: 'Profile', path: '/profile' },
    { icon: <ShoppingBag size={18} />, label: 'My Orders', path: '/orders' },
    { icon: <Heart size={18} />, label: 'Wishlist', path: '/wishlist' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-72 bg-gradient-to-b from-[#1c1716] to-[#2a2423] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
    >
      {isLoggedIn ? (
        <>
          {/* A. Header Section */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD700] to-amber-200 p-0.5 shadow-lg shadow-[#FFD700]/10">
                <div className="w-full h-full rounded-full bg-[#1c1716] flex items-center justify-center overflow-hidden border-2 border-[#1c1716]">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#FFD700] font-black text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-black text-base truncate tracking-tight uppercase">
                  {user?.name}
                </h4>
                <p className="text-[10px] text-white/40 truncate font-medium lowercase font-mono">
                  {user?.email || 'member@phancoffee.com'}
                </p>
              </div>
            </div>
          </div>
 
          {/* B. Main Actions Layer */}
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleAction(item.path)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all group text-white/70 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#1c1716] transition-all">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#FFD700]" />
              </button>
            ))}
          </div>
 
          {/* C. Footer Layer */}
          <div className="mt-auto border-t border-white/5 p-2 bg-black/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-500/10 transition-all group text-red-400 font-bold text-sm cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={18} />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col">
          {/* Guest Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700] mb-1">Account</p>
            <h3 className="text-white font-black text-xl tracking-tight uppercase">Guest User</h3>
          </div>
 
          {/* Guest Content */}
          <div className="p-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-6 mx-auto border border-white/10 rotate-3 transition-transform">
              <User size={32} />
            </div>
            <p className="text-xs text-white/50 text-center mb-8 font-medium leading-relaxed max-w-[200px] mx-auto">
              Join our heritage circle to track your orders and enjoy exclusive coffee perks.
            </p>
            <button
              onClick={() => {
                onLoginClick();
                onClose();
              }}
              className="w-full py-4 bg-[#4B3621] text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white hover:text-[#4B3621] transition-all transform active:scale-95 shadow-xl shadow-[#4B3621]/10 cursor-pointer"
            >
              Login Now <ArrowRight size={14} />
            </button>
          </div>
 
          {/* Guest Footer Tagline */}
          <div className="border-t border-white/5 p-4 bg-black/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Phan Coffee • Est 1995</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dropdown;
