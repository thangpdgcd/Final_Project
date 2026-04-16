import { httpClient } from '@/shared/lib/http/client';
import type { SupportChatConversation, SupportChatMessage, SupportChatUser } from '../types';

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
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

const mapUser = (raw: any): SupportChatUser | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const userId = toNumber(raw.userId ?? raw.user_ID ?? raw.id, 0);
  if (!userId) return undefined;
  return {
    userId,
    name: toString(raw.name ?? raw.username ?? raw.fullName, `User ${userId}`),
    avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : typeof raw.avatar === 'string' ? raw.avatar : undefined,
    role: typeof raw.role === 'string' ? raw.role : typeof raw.roleName === 'string' ? raw.roleName : undefined,
  };
};

const mapConversation = (raw: any): SupportChatConversation | null => {
  const conversationId = toNumber(raw.conversationId ?? raw.conversation_ID ?? raw.id, 0);
  if (!conversationId) return null;

  const title = toString(raw.title ?? raw.name ?? raw.subject, `Conversation ${conversationId}`);
  const unreadCount = toNumber(raw.unreadCount ?? raw.unread_count ?? raw.unread ?? 0, 0);

  const lastMessagePreview =
    typeof raw.lastMessagePreview === 'string'
      ? raw.lastMessagePreview
      : typeof raw.last_message_preview === 'string'
        ? raw.last_message_preview
        : typeof raw.lastMessage?.content === 'string'
          ? raw.lastMessage.content
          : typeof raw.lastMessage === 'string'
            ? raw.lastMessage
            : undefined;

  const lastMessageAt =
    typeof raw.lastMessageAt === 'number'
      ? raw.lastMessageAt
      : typeof raw.last_message_at === 'number'
        ? raw.last_message_at
        : raw.updatedAt
          ? Date.parse(String(raw.updatedAt)) || undefined
          : raw.createdAt
            ? Date.parse(String(raw.createdAt)) || undefined
            : undefined;

  const avatarUrl =
    typeof raw.avatarUrl === 'string'
      ? raw.avatarUrl
      : typeof raw.avatar === 'string'
        ? raw.avatar
        : typeof raw.otherUser?.avatarUrl === 'string'
          ? raw.otherUser.avatarUrl
          : typeof raw.otherUser?.avatar === 'string'
            ? raw.otherUser.avatar
            : undefined;

  return {
    conversationId,
    title,
    avatarUrl,
    lastMessagePreview,
    lastMessageAt,
    unreadCount,
  };
};

const mapMessage = (raw: any, conversationIdFallback?: number): SupportChatMessage | null => {
  const conversationId = toNumber(raw.conversationId ?? raw.conversation_ID ?? raw.conversation ?? conversationIdFallback, 0);
  if (!conversationId) return null;

  const id = raw.id ?? raw.messageId ?? raw.message_ID ?? raw.message_id;
  const createdAt =
    typeof raw.createdAt === 'number'
      ? raw.createdAt
      : typeof raw.created_at === 'number'
        ? raw.created_at
        : raw.createdAt
          ? Date.parse(String(raw.createdAt))
          : raw.timestamp
            ? Date.parse(String(raw.timestamp))
            : Date.now();

  const type = raw.type === 'action' ? 'action' : 'text';
  const sender = mapUser(raw.sender ?? raw.fromUser ?? raw.user);

  if (type === 'action') {
    const action = toString(raw.action, '') as any;
    const meta = raw.meta && typeof raw.meta === 'object' ? raw.meta : undefined;
    if (!action || !meta) return null;
    return {
      id: id ?? `${conversationId}-${createdAt}`,
      conversationId,
      type: 'action',
      action,
      meta,
      sender,
      createdAt: toNumber(createdAt, Date.now()),
    } as any;
  }

  const content = toString(raw.content ?? raw.text ?? raw.message, '');
  return {
    id: id ?? `${conversationId}-${createdAt}`,
    conversationId,
    type: 'text',
    content,
    sender,
    createdAt: toNumber(createdAt, Date.now()),
  };
};

export const supportChatApi = {
  getConversations: async (): Promise<SupportChatConversation[]> => {
    const res = await httpClient.get('/conversations');
    const list = pickArray(res.data);
    return list.map(mapConversation).filter(Boolean) as SupportChatConversation[];
  },

  getMessages: async (conversationId: number, params?: { limit?: number; offset?: number }): Promise<SupportChatMessage[]> => {
    if (!conversationId) return [];
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const res = await httpClient.get(`/messages/${conversationId}`, { params: { limit, offset } });
    const list = pickArray(res.data);
    return list.map((m) => mapMessage(m, conversationId)).filter(Boolean) as SupportChatMessage[];
  },

  postMessage: async (body: {
    conversationId?: number;
    recipientUserId?: number;
    type: 'text';
    content: string;
  }): Promise<SupportChatMessage | null> => {
    const res = await httpClient.post('/messages', body);
    const raw = res.data?.message ?? res.data?.data ?? res.data;
    return mapMessage(raw, body.conversationId);
  },
};

