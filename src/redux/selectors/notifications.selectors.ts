import type { RootState } from '@/redux/store';

export const selectNotifications = (s: RootState) => s.notifications.items;
export const selectNotificationsStatus = (s: RootState) => s.notifications.status;
export const selectNotificationsError = (s: RootState) => s.notifications.error;
export const selectNotificationsHydratedForUserId = (s: RootState) => s.notifications.hydratedForUserId;
export const selectNotificationsUnreadCount = (s: RootState) =>
  s.notifications.items.reduce((sum, n) => sum + (n.read ? 0 : 1), 0);

