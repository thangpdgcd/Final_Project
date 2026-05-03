export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'order'
  | 'promo'
  | 'email'
  | 'system';

export type AppNotification = {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: string; // ISO date string
  read: boolean;
  /** Optional extra payload from server (orderId, url, etc). */
  meta?: Record<string, unknown>;
};

