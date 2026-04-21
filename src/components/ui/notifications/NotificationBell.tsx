import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/store/auth/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useTranslation } from 'react-i18next';
import { i18nKeys } from '@/constants/i18nKeys';
import { useNavigate } from 'react-router-dom';

type Props = {
  className?: string;
};

const NotificationBell: React.FC<Props> = ({ className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userId = isAuthenticated ? Number((user as any)?.user_ID ?? 0) : 0;

  const { notifications, unreadCount, isOpen, toggle, close, api } = useNotifications(userId || null);
  const [bounce, setBounce] = useState(false);

  const badge = useMemo(() => (unreadCount > 99 ? '99+' : unreadCount ? String(unreadCount) : ''), [
    unreadCount,
  ]);

  useEffect(() => {
    if (!unreadCount) return;
    setBounce(true);
    const tt = window.setTimeout(() => setBounce(false), 350);
    return () => window.clearTimeout(tt);
  }, [unreadCount]);

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={toggle}
        className={[
          'relative flex items-center justify-center w-10 h-10 rounded-full border-[2.5px]',
          'transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900',
          'border-transparent bg-transparent text-stone-700 dark:text-stone-300',
          'hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-orange-600 dark:hover:text-orange-400',
        ].join(' ')}
        aria-label={t(i18nKeys.notifications.ui.ariaBell)}
      >
        <Bell size={18} />
        {badge && (
          <span
            className={[
              'absolute -top-1 -right-1 flex items-center justify-center rounded-full',
              'bg-[var(--gold)] text-[10px] font-bold text-[var(--coffee-brown)] border-2 border-white dark:border-[#1c1716]',
              'min-w-5 h-5 px-1',
              bounce ? 'scale-110' : 'scale-100',
              'transition-transform duration-200',
            ].join(' ')}
          >
            {badge}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={isOpen}
        onClose={close}
        items={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={async () => {
          await api.markAllRead();
        }}
        onItemClick={async (id) => {
          const n = notifications.find((x) => x.id === id);
          const orderId = Number((n?.meta as any)?.orderId ?? 0);
          await api.markRead(id);
          close();
          if (n?.type === 'order' && Number.isFinite(orderId) && orderId > 0) {
            navigate(`/profile?tab=orders&orderId=${orderId}`);
          }
        }}
      />
    </div>
  );
};

export default NotificationBell;

