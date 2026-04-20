import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

/**
 * Production-ready SimpleModal component
 * Features: Framer motion animations, body scroll lock, ESC to close, click outside to close
 */
const SimpleModal: React.FC<SimpleModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-sm',
  showCloseButton = true,
}) => {
  // --- LOGIC: Body Scroll Lock ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // --- LOGIC: ESC Key Closing ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay / Backdrop - z-40 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal Content - z-50 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-[90%] ${maxWidth} bg-white dark:bg-[#1a1615] rounded-3xl shadow-2xl z-50 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section if title or showCloseButton is true */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800/50">
                {title ? (
                  <h3 className="text-xl font-black text-[#4B3621] dark:text-amber-100 tracking-tight leading-none">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#4B3621] dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body content */}
            <div className="p-6 sm:p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SimpleModal;
