import { httpClient } from '@/api/http/client';
import type { SupportWidgetConversation, SupportWidgetMessage, SupportWidgetUser } from '../types';

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
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

const mapUser = (raw: any): SupportWidgetUser | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const userId = toNumber(
    raw.userId ??
      raw.user_ID ??
      raw.id ??
      raw.senderUserId ??
      raw.fromUserId ??
      raw.staffId ??
      raw.staffUserId ??
      raw.sender_id ??
      raw.user?.userId ??
      raw.user?.user_ID ??
      raw.user?.id ??
      raw.staff?.userId ??
      raw.staff?.user_ID ??
      raw.staff?.id,
    0,
  );
  if (!userId) return undefined;
  const name =
    pickString(
      raw.name,
      raw.displayName,
      raw.display_name,
      raw.username,
      raw.fullName,
      raw.full_name,
      raw.senderName,
      raw.sender_name,
      raw.staffName,
      raw.staff_name,
      raw.userName,
      raw.user_name,
      raw.fromUserName,
      raw.from_user_name,
      raw.profile?.name,
      raw.profile?.displayName,
      raw.user?.name,
      raw.user?.displayName,
      raw.user?.username,
      raw.staff?.name,
      raw.staff?.displayName,
      raw.staff?.username,
    ) ?? `User ${userId}`;

  const avatarUrl = pickString(
    raw.avatarUrl,
    raw.avatar_url,
    raw.avatar,
    raw.photoUrl,
    raw.photo_url,
    raw.imageUrl,
    raw.image_url,
    raw.image,
    raw.profile?.avatarUrl,
    raw.profile?.avatar,
    raw.user?.avatarUrl,
    raw.user?.avatar,
    raw.staff?.avatarUrl,
    raw.staff?.avatar,
  );

  return { userId, name, avatarUrl };
};

const mapConversation = (raw: any): SupportWidgetConversation | null => {
  const conversationId = toNumber(raw.conversationId ?? raw.conversation_ID ?? raw.id, 0);
  if (!conversationId) return null;

  const title = toString(raw.title ?? raw.name ?? raw.subject, 'Support');
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

  const participantsRaw = Array.isArray(raw.participants)
    ? raw.participants
    : Array.isArray(raw.members)
      ? raw.members
      : [];
  const participants = participantsRaw
    .map((p: any) => ({
      userId: toNumber(p?.userId ?? p?.user_ID ?? p?.id, 0),
      roleAtJoin:
        typeof p?.roleAtJoin === 'string'
          ? p.roleAtJoin
          : typeof p?.role === 'string'
            ? p.role
            : undefined,
      name: pickString(p?.name, p?.displayName, p?.display_name, p?.username, p?.fullName, p?.full_name),
    }))
    .filter((p: any) => p.userId > 0);

  return { conversationId, title, avatarUrl, lastMessagePreview, lastMessageAt, participants };
};

const mapMessage = (raw: any, conversationIdFallback?: number): SupportWidgetMessage | null => {
  const conversationId = toNumber(
    raw.conversationId ?? raw.conversation_ID ?? raw.conversation ?? conversationIdFallback,
    0,
  );
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
  const sender = mapUser(raw.sender ?? raw.fromUser ?? raw.user ?? raw.staff) ?? mapUser(raw);

  if (type === 'action') {
    const action = toString(raw.action, '');
    if (!action) return null;
    return {
      id: id ?? `${conversationId}-${createdAt}`,
      conversationId,
      type: 'action',
      action,
      meta: raw.meta,
      sender,
      createdAt: toNumber(createdAt, Date.now()),
    };
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

export const supportWidgetApi = {
  getConversations: async (params?: {
    userId?: number;
    limit?: number;
    offset?: number;
    mineOnly?: boolean;
  }): Promise<SupportWidgetConversation[]> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.userId && params.userId > 0) {
      queryParams.userId = params.userId;
      queryParams.customerId = params.userId;
      queryParams.participantUserId = params.userId;
    }
    if (typeof params?.mineOnly === 'boolean') {
      queryParams.mine = params.mineOnly;
    }
    if (typeof params?.limit === 'number') {
      queryParams.limit = params.limit;
    }
    if (typeof params?.offset === 'number') {
      queryParams.offset = params.offset;
    }
    const res = await httpClient.get('/conversations', { params: queryParams });
    const list = pickArray(res.data);
    return list.map(mapConversation).filter(Boolean) as SupportWidgetConversation[];
  },

  getMessages: async (
    conversationId: number,
    params?: { limit?: number; offset?: number },
  ): Promise<SupportWidgetMessage[]> => {
    if (!conversationId || conversationId <= 0) return [];
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const res = await httpClient.get(`/messages/${conversationId}`, { params: { limit, offset } });
    const list = pickArray(res.data);
    return list.map((m) => mapMessage(m, conversationId)).filter(Boolean) as SupportWidgetMessage[];
  },

  postMessage: async (body: {
    conversationId?: number;
    recipientUserId?: number;
    type: 'text';
    content: string;
  }): Promise<SupportWidgetMessage | null> => {
    const res = await httpClient.post('/messages', body);
    const rawEnvelope = res.data?.message ?? res.data?.data ?? res.data;
    const raw = rawEnvelope?.message && typeof rawEnvelope.message === 'object' ? rawEnvelope.message : rawEnvelope;
    return mapMessage(raw, body.conversationId);
  },
};

