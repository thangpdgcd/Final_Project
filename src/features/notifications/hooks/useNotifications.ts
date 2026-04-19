import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { AppNotification } from '../types';
import { notificationsApi } from '../notifications.api';
import { selectUnreadCount, useNotificationsStore } from '../notifications.store';
import { ensureSocketConnected, joinNotificationsRoom, resetJoinedRoom } from '../socket/notifications.socket';

type RawSocketNotification = any;

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
  const id = String(raw.id ?? raw.notificationId ?? raw.notification_ID ?? raw._id ?? raw.uuid ?? '').trim();
  const message = String(raw.message ?? raw.content ?? raw.title ?? raw.text ?? '').trim();
  if (!id || !message) return null;
  const createdAt = String(raw.createdAt ?? raw.created_at ?? raw.time ?? raw.timestamp ?? new Date().toISOString());
  const type = String(raw.type ?? raw.kind ?? 'info').toLowerCase();
  return {
    id,
    message,
    type: (type as any) || 'info',
    createdAt,
    read: Boolean(raw.read ?? raw.isRead ?? raw.seen ?? false),
    meta: typeof raw.meta === 'object' && raw.meta ? raw.meta : undefined,
  };
};

export const useNotifications = (userId: number | null | undefined) => {
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore(selectUnreadCount);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const hydratedForUserId = useNotificationsStore((s) => s.hydratedForUserId);
  const setHydratedForUserId = useNotificationsStore((s) => s.setHydratedForUserId);
  const clear = useNotificationsStore((s) => s.clear);
  const markReadOptimistic = useNotificationsStore((s) => s.markReadOptimistic);
  const markAllReadOptimistic = useNotificationsStore((s) => s.markAllReadOptimistic);

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
      clear();
      setHydratedForUserId(null);
      return;
    }

    userIdRef.current = uid;

    if (hydratedForUserId === uid) return;
    let alive = true;
    (async () => {
      try {
        const items = await notificationsApi.fetch();
        if (!alive) return;
        setNotifications(items);
        setHydratedForUserId(uid);
      } catch {
        // keep empty state; socket can still push realtime updates
        if (!alive) return;
        setHydratedForUserId(uid);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, hydratedForUserId, setHydratedForUserId, setNotifications, clear]);

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
      addNotification({ ...n, read: false });
      toast.info(n.message, { autoClose: 2500 });
    };

    socket.off('receive_notification', handler);
    socket.on('receive_notification', handler);

    return () => {
      // Remove handler only; keep socket alive for other modules.
      socket.off('receive_notification', handler);
      listenerAttachedRef.current = false;
    };
  }, [userId, addNotification]);

  const api = useMemo(
    () => ({
      markRead: async (id: string) => {
        markReadOptimistic(id);
        try {
          await notificationsApi.markRead(id);
        } catch {
          // if API fails, keep optimistic read to avoid annoying bounce
        }
      },
      markAllRead: async () => {
        markAllReadOptimistic();
        try {
          await notificationsApi.markAllRead();
        } catch {
          // keep optimistic
        }
      },
    }),
    [markAllReadOptimistic, markReadOptimistic],
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

