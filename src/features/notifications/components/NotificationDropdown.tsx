import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationItem from './NotificationItem';
import type { AppNotification } from '../types';
import { useTranslation } from 'react-i18next';
import { i18nKeys } from '@/constants/i18nKeys';
import { dropdownPop } from '@/utils/motion';

type Props = {
  open: boolean;
  onClose: () => void;
  items: AppNotification[];
  onItemClick: (id: string) => void;
  unreadCount: number;
  onMarkAllRead: () => void;
};

const NotificationDropdown: React.FC<Props> = ({
  open,
  onClose,
  items,
  onItemClick,
  unreadCount,
  onMarkAllRead,
}) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = panelRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={dropdownPop}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute right-0 top-12 z-[80] w-[min(92vw,420px)]"
        >
          <div
            ref={panelRef}
            className="rounded-2xl border border-stone-200/80 bg-white shadow-2xl shadow-black/10 overflow-hidden dark:border-white/10 dark:bg-[#141313]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-white/10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-700 dark:text-white/80">
                {t(i18nKeys.notifications.ui.title)}
              </p>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[11px] font-bold text-stone-700 hover:text-stone-900 dark:text-white/60 dark:hover:text-white"
                  >
                    {t(i18nKeys.notifications.ui.markAllRead)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] font-bold text-stone-500 hover:text-stone-900 dark:text-white/45 dark:hover:text-white/80"
                >
                  {t(i18nKeys.notifications.ui.close)}
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-semibold text-stone-700 dark:text-white/75">
                    {t(i18nKeys.notifications.ui.emptyTitle)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-white/45">
                    {t(i18nKeys.notifications.ui.emptyDesc)}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {items.slice(0, 30).map((n) => (
                    <NotificationItem key={n.id} item={n} onClick={onItemClick} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
