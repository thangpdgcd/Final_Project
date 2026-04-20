import { create } from 'zustand';
import type { AppNotification } from './types';

type NotificationsState = {
  notifications: AppNotification[];
  lastReceivedAt: number;
  hydratedForUserId: number | null;
  setHydratedForUserId: (userId: number | null) => void;
  setNotifications: (items: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markReadOptimistic: (id: string) => void;
  markAllReadOptimistic: () => void;
  clear: () => void;
};

const dedupeById = (items: AppNotification[]): AppNotification[] => {
  const map = new Map<string, AppNotification>();
  for (const it of items) {
    map.set(it.id, it);
  }
  return Array.from(map.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  lastReceivedAt: 0,
  hydratedForUserId: null,
  setHydratedForUserId: (userId) => set({ hydratedForUserId: userId }),
  setNotifications: (items) => set({ notifications: dedupeById(items) }),
  addNotification: (n) => {
    const next = dedupeById([n, ...get().notifications]);
    set({ notifications: next, lastReceivedAt: Date.now() });
  },
  markReadOptimistic: (id) =>
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }),
  markAllReadOptimistic: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    }),
  clear: () => set({ notifications: [], lastReceivedAt: 0, hydratedForUserId: null }),
}));

export const selectUnreadCount = (s: { notifications: AppNotification[] }) =>
  s.notifications.reduce((sum, n) => sum + (n.read ? 0 : 1), 0);
