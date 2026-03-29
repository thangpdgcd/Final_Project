import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';
import Dropdown from './Dropdown';
import { useTranslation } from 'react-i18next';
import { getImageSrc } from '@/utils/image';

interface UserMenuProps {
  onLoginClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // --- LOGIC: Toggles & Navigation ---
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      onLoginClick();
    }
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setIsOpen(false);
  };

  // --- LOGIC: Outside Click & Keyboard ---
  useEffect(() => {
    const handleEvents = (event: MouseEvent | KeyboardEvent) => {
      // 1. Handle ESC Key (KeyboardEvent)
      if (event.type === 'keydown' && 'key' in event && event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // 2. Handle Click Outside (MouseEvent)
      if (event.type === 'mousedown') {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleEvents);
      document.addEventListener('keydown', handleEvents, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleEvents);
      document.removeEventListener('keydown', handleEvents, true);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        <div className="w-8 h-10 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div 
      className="relative flex items-center gap-1.5 z-50 w-fit" 
      ref={menuRef}
    >
      {/* 1. Avatar Area */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAvatarClick}
        className="relative group p-0.5 rounded-full border border-stone-200 hover:border-[#FFD700] dark:border-white/10 transition-colors duration-300 cursor-pointer"
        aria-label={t('profile.title')}
      >
        <div className="absolute inset-0 bg-[#FFD700]/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center overflow-hidden relative z-10 border border-stone-200 dark:border-white/5">
          {isAuthenticated && user?.avatar ? (
            <img src={getImageSrc(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
          ) : isAuthenticated && user?.name ? (
            <span className="text-[#FFD700] font-black text-sm uppercase">
              {user.name.charAt(0)}
            </span>
          ) : (
            <User size={20} className="text-stone-700 dark:text-white group-hover:text-[#FFD700] transition-colors" />
          )}
        </div>
      </motion.button>

      {/* 2. Chevron Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`w-8 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group cursor-pointer
          ${isOpen ? 'text-[#FFD700] bg-stone-100 dark:bg-white/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5'}
        `}
      >
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 pointer-events-none ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 3. Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full right-0 mt-3 z-[60]">
            <Dropdown 
              isLoggedIn={isAuthenticated} 
              user={user} 
              onLogout={handleLogout}
              onClose={() => setIsOpen(false)}
              onLoginClick={onLoginClick}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
