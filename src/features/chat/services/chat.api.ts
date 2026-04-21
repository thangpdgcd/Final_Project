import { http as axiosInstance } from '@/api/http/http';
import type { ChatMessage, Conversation } from '../types';

const toStringOr = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
};

const toNumberOr = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const pickArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.messages)) return data.messages;
  return [];
};

const mapConversation = (raw: any): Conversation => {
  const roomId = toStringOr(raw?.roomId ?? raw?.room_id ?? raw?.room ?? raw?.id, '');
  const title = toStringOr(raw?.title ?? raw?.name ?? raw?.subject ?? roomId, roomId);
  const lastMessagePreview =
    typeof raw?.lastMessagePreview === 'string'
      ? raw.lastMessagePreview
      : typeof raw?.last_message_preview === 'string'
        ? raw.last_message_preview
        : typeof raw?.lastMessage === 'string'
          ? raw.lastMessage
          : undefined;
  const unreadCountRaw = raw?.unreadCount ?? raw?.unread_count ?? raw?.unread ?? 0;
  const unreadCount = toNumberOr(unreadCountRaw, 0);

  return {
    roomId,
    title,
    lastMessagePreview,
    unreadCount,
  };
};

const mapMessage = (raw: any, roomIdFallback?: string): ChatMessage | null => {
  const roomId = toStringOr(raw?.roomId ?? raw?.room_id ?? raw?.room ?? roomIdFallback, '');
  const id = toStringOr(raw?.id ?? raw?.messageId ?? raw?.message_id, '');
  const createdAt = toNumberOr(raw?.createdAt ?? raw?.created_at ?? raw?.timestamp, Date.now());

  const senderId = toStringOr(
    raw?.sender?.id ?? raw?.senderId ?? raw?.sender_id ?? raw?.from ?? 'unknown',
    'unknown',
  );
  const senderName = toStringOr(
    raw?.sender?.name ?? raw?.senderName ?? raw?.sender_name ?? 'Unknown',
    'Unknown',
  );
  const senderRole = (raw?.sender?.role ?? raw?.senderRole ?? raw?.sender_role ?? 'user') as any;

  const type = raw?.type === 'action' ? 'action' : 'text';

  if (!roomId) return null;
  if (!id) return null;

  if (type === 'action') {
    const action = raw?.action;
    if (!action || typeof action !== 'object') return null;
    return {
      id,
      roomId,
      createdAt,
      type: 'action',
      action,
      sender: { id: senderId, name: senderName, role: senderRole },
    } as any;
  }

  const text = toStringOr(raw?.text ?? raw?.message ?? raw?.content, '');
  return {
    id,
    roomId,
    createdAt,
    type: 'text',
    text,
    sender: { id: senderId, name: senderName, role: senderRole },
  };
};

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await axiosInstance.get('/conversations');
    const list = pickArray(res.data);
    return list.map(mapConversation).filter((c) => Boolean(c.roomId));
  },

  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    if (!roomId) return [];

    try {
      const res = await axiosInstance.get(`/conversations/${encodeURIComponent(roomId)}/messages`);
      const list = pickArray(res.data);
      return list.map((m) => mapMessage(m, roomId)).filter(Boolean) as ChatMessage[];
    } catch {
      const res = await axiosInstance.get('/messages', { params: { roomId } });
      const list = pickArray(res.data);
      return list.map((m) => mapMessage(m, roomId)).filter(Boolean) as ChatMessage[];
    }
  },
};
