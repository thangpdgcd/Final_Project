import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import i18n from '@/translates/i18n';
import type { AppNotification } from '@/features/notifications/types';
import {
  addNotification,
  clearNotifications,
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markAllReadOptimistic,
  markNotificationReadThunk,
  markReadOptimistic,
  setHydratedForUserId,
} from '@/redux/slices/notificationsSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectNotificationsUnreadCount } from '@/redux/selectors';
import {
  ensureSocketConnected,
  joinNotificationsRoom,
  resetJoinedRoom,
} from '@/features/notifications/socket/notifications.socket';

type RawSocketNotification = any;

const extractOrderIdFromMessage = (message: string): number | null => {
  const m = /#\s*(\d+)/.exec(String(message ?? ''));
  const id = m ? Number(m[1]) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
};

const displayNotificationMessage = (n: AppNotification): string => {
  const orderId = Number((n.meta as any)?.orderId ?? 0);
  if (n.type === 'order') {
    return String(
      i18n.t(
        'notifications.templates.orderCreated',
        Number.isFinite(orderId) && orderId > 0 ? { id: orderId } : undefined,
      ),
    );
  }
  return n.message;
};

const normalizeSocketNotification = (raw: RawSocketNotification): AppNotification | null => {
  if (!raw) return null;
  if (typeof raw === 'string') {
    return {
      id: `${Date.now()}`,
      message: raw,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  const id = String(
    raw.id ?? raw.notificationId ?? raw.notification_ID ?? raw._id ?? raw.uuid ?? '',
  ).trim();
  const message = String(raw.message ?? raw.content ?? raw.title ?? raw.text ?? '').trim();
  if (!id || !message) return null;
  const createdAt = String(
    raw.createdAt ?? raw.created_at ?? raw.time ?? raw.timestamp ?? new Date().toISOString(),
  );
  const type = String(raw.type ?? raw.kind ?? 'info').toLowerCase();
  const meta = typeof raw.meta === 'object' && raw.meta ? raw.meta : undefined;
  const orderId = String(type).includes('order') ? extractOrderIdFromMessage(message) : null;
  return {
    id,
    message,
    type: (type as any) || 'info',
    createdAt,
    read: Boolean(raw.read ?? raw.isRead ?? raw.seen ?? false),
    meta:
      orderId && !(meta as any)?.orderId
        ? { ...(meta ?? {}), orderId }
        : meta,
  };
};

export const useNotifications = (userId: number | null | undefined) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.items);
  const unreadCount = useAppSelector(selectNotificationsUnreadCount);
  const hydratedForUserId = useAppSelector((s) => s.notifications.hydratedForUserId);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  const listenerAttachedRef = useRef(false);
  const userIdRef = useRef<number | null>(null);

  // Bootstrap notifications list per user.
  useEffect(() => {
    const uid = Number(userId ?? 0);
    if (!uid || !Number.isFinite(uid)) {
      userIdRef.current = null;
      listenerAttachedRef.current = false;
      resetJoinedRoom();
      dispatch(clearNotifications());
      dispatch(setHydratedForUserId(null));
      return;
    }

    userIdRef.current = uid;

    if (hydratedForUserId === uid) return;
    let alive = true;
    (async () => {
      try {
        if (!alive) return;
        await dispatch(fetchNotificationsThunk()).unwrap();
        dispatch(setHydratedForUserId(uid));
      } catch {
        // keep empty state; socket can still push realtime updates
        if (!alive) return;
        dispatch(setHydratedForUserId(uid));
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, userId, hydratedForUserId]);

  // Socket connect + join room + listener (deduped).
  useEffect(() => {
    const uid = Number(userId ?? 0);
    if (!uid || !Number.isFinite(uid)) return;

    const socket = ensureSocketConnected();
    joinNotificationsRoom(uid);

    if (listenerAttachedRef.current) return;
    listenerAttachedRef.current = true;

    const handler = (raw: RawSocketNotification) => {
      const n = normalizeSocketNotification(raw);
      if (!n) return;
      dispatch(addNotification({ ...n, read: false }));
      toast.info(displayNotificationMessage(n), { autoClose: 2500 });
    };

    socket.off('receive_notification', handler);
    socket.on('receive_notification', handler);

    return () => {
      // Remove handler only; keep socket alive for other modules.
      socket.off('receive_notification', handler);
      listenerAttachedRef.current = false;
    };
  }, [dispatch, userId]);

  const api = useMemo(
    () => ({
      markRead: async (id: string) => {
        dispatch(markReadOptimistic(id));
        await dispatch(markNotificationReadThunk(id)).unwrap().catch(() => undefined);
      },
      markAllRead: async () => {
        dispatch(markAllReadOptimistic());
        await dispatch(markAllNotificationsReadThunk()).unwrap().catch(() => undefined);
      },
    }),
    [dispatch],
  );

  return {
    notifications,
    unreadCount,
    isOpen,
    toggle,
    close,
    api,
  };
};

