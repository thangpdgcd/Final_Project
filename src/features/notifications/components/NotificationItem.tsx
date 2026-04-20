import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, ShoppingBag, Sparkles } from 'lucide-react';
import type { AppNotification } from '../types';
import { formatTimeAgo } from '../lib/time';
import { useTranslation } from 'react-i18next';

const typeIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    case 'warning':
      return <AlertTriangle size={16} className="text-amber-500" />;
    case 'error':
      return <XCircle size={16} className="text-rose-500" />;
    case 'order':
      return <ShoppingBag size={16} className="text-sky-500" />;
    case 'promo':
      return <Sparkles size={16} className="text-fuchsia-500" />;
    case 'system':
      return <Info size={16} className="text-stone-400" />;
    default:
      return <Info size={16} className="text-stone-400" />;
  }
};

type Props = {
  item: AppNotification;
  onClick: (id: string) => void;
};

const NotificationItem: React.FC<Props> = ({ item, onClick }) => {
  const { t } = useTranslation();
  const orderId = Number((item.meta as any)?.orderId ?? 0);
  const message =
    item.type === 'order'
      ? t(
          'notifications.templates.orderCreated',
          Number.isFinite(orderId) && orderId > 0 ? { id: orderId } : undefined,
        )
      : item.message;
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={[
        'w-full text-left rounded-xl px-3 py-3 flex items-start gap-3',
        'transition-colors border border-transparent hover:border-stone-200/70 dark:hover:border-white/10',
        'hover:bg-stone-50 dark:hover:bg-white/5',
      ].join(' ')}
    >
      <div className="mt-0.5 flex-shrink-0">{typeIcon(item.type)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={[
              'text-sm leading-snug',
              item.read
                ? 'text-stone-600 dark:text-white/65'
                : 'text-stone-900 dark:text-white font-semibold',
              'break-words',
            ].join(' ')}
          >
            {message}
          </p>
          {!item.read && (
            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--gold)] flex-shrink-0" />
          )}
        </div>
        <p className="mt-1 text-[11px] font-medium text-stone-400 dark:text-white/40">
          {formatTimeAgo(item.createdAt)}
        </p>
      </div>
    </button>
  );
};

export default NotificationItem;
