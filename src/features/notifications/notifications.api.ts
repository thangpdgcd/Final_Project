import api from '@/api/axiosInstances/axiosInstance';
import type { AppNotification, NotificationType } from './types';

type RawNotification = any;

const extractOrderIdFromMessage = (message: string): number | null => {
  const m = /#\s*(\d+)/.exec(String(message ?? ''));
  const id = m ? Number(m[1]) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
};

const toIsoString = (v: unknown): string => {
  if (typeof v === 'string' && v.trim()) return v;
  if (typeof v === 'number' && Number.isFinite(v)) return new Date(v).toISOString();
  return new Date().toISOString();
};

const normalizeType = (v: unknown): NotificationType => {
  const t = String(v ?? '')
    .trim()
    .toLowerCase();
  if (t === 'success' || t === 'warning' || t === 'error' || t === 'info') return t;
  if (t.includes('order')) return 'order';
  if (t.includes('promo') || t.includes('sale')) return 'promo';
  if (t) return 'system';
  return 'info';
};

const normalizeNotification = (raw: RawNotification): AppNotification | null => {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id ?? raw.notification_ID ?? raw.notificationId ?? raw._id ?? raw.uuid ?? '').trim();
  if (!id) return null;
  const message = String(raw.message ?? raw.content ?? raw.title ?? raw.text ?? '').trim();
  if (!message) return null;
  const createdAt = toIsoString(raw.createdAt ?? raw.created_at ?? raw.time ?? raw.timestamp ?? raw.date);
  const read = Boolean(raw.read ?? raw.isRead ?? raw.seen ?? raw.status === 'read');
  const type = normalizeType(raw.type ?? raw.kind ?? raw.level);
  const metaRaw = typeof raw.meta === 'object' && raw.meta ? raw.meta : undefined;
  const orderId = type === 'order' ? extractOrderIdFromMessage(message) : null;
  return {
    id,
    message,
    type,
    createdAt,
    read,
    meta: orderId && !metaRaw?.orderId ? { ...(metaRaw ?? {}), orderId } : metaRaw,
  };
};

export const notificationsApi = {
  fetch: async (): Promise<AppNotification[]> => {
    const candidates = ['/notifications', '/users/notifications', '/notification', '/me/notifications'];
    let lastErr: unknown;
    for (const url of candidates) {
      try {
        const res = await api.get(url);
        const raw =
          (res.data as any)?.data ??
          (res.data as any)?.result ??
          (res.data as any)?.notifications ??
          (res.data as any)?.items ??
          res.data;
        const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
        const normalized = arr.map(normalizeNotification).filter(Boolean) as AppNotification[];
        return normalized;
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status;
        if (status === 401 || status === 403) throw e;
        if (status !== 404) break;
      }
    }
    if (lastErr) throw lastErr;
    return [];
  },

  markRead: async (id: string): Promise<void> => {
    const safeId = encodeURIComponent(id);
    const candidates: Array<{ method: 'post' | 'patch'; url: string; body?: any }> = [
      { method: 'patch', url: `/notifications/${safeId}/read`, body: {} },
      { method: 'post', url: `/notifications/${safeId}/read`, body: {} },
      { method: 'patch', url: `/notifications/${safeId}`, body: { read: true } },
      { method: 'post', url: `/notification/${safeId}/read`, body: {} },
    ];
    let lastErr: unknown;
    for (const c of candidates) {
      try {
        if (c.method === 'post') await api.post(c.url, c.body ?? {});
        else await api.patch(c.url, c.body ?? {});
        return;
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status;
        if (status && status !== 404 && status !== 405) break;
      }
    }
    if (lastErr) throw lastErr;
  },

  markAllRead: async (): Promise<void> => {
    const candidates: Array<{ method: 'patch' | 'post'; url: string; body?: any }> = [
      { method: 'patch', url: '/notifications/read-all', body: {} },
      { method: 'post', url: '/notifications/read-all', body: {} },
    ];
    let lastErr: unknown;
    for (const c of candidates) {
      try {
        if (c.method === 'post') await api.post(c.url, c.body ?? {});
        else await api.patch(c.url, c.body ?? {});
        return;
      } catch (e: any) {
        lastErr = e;
        const status = e?.response?.status;
        if (status && status !== 404 && status !== 405) break;
      }
    }
    if (lastErr) throw lastErr;
  },
};

