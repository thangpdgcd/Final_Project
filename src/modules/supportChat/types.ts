export type SupportChatMessageType = 'text' | 'action';

export type SupportChatUser = {
  userId: number;
  name: string;
  avatarUrl?: string;
  role?: string;
};

export type OnlineStaffUser = SupportChatUser & {
  role: 'staff' | string;
};

export type SupportChatConversation = {
  conversationId: number;
  title: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  unreadCount: number;
};

export type SupportChatActionName = 'UPDATE_USER' | 'UPDATE_STAFF';

export type SupportChatActionMeta = {
  targetUserId: number;
  patch: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
};

export type SupportChatMessageBase = {
  id: number | string;
  conversationId: number;
  sender?: SupportChatUser;
  createdAt: number;
  optimistic?: {
    clientId: string;
    status: 'sending' | 'sent' | 'failed';
  };
};

export type SupportChatTextMessage = SupportChatMessageBase & {
  type: 'text';
  content: string;
};

export type SupportChatActionMessage = SupportChatMessageBase & {
  type: 'action';
  action: SupportChatActionName;
  meta: SupportChatActionMeta;
};

export type SupportChatMessage = SupportChatTextMessage | SupportChatActionMessage;

export type JoinRoomPayload = { conversationId: number } | Record<string, never>;

export type SendMessagePayload =
  | {
      conversationId: number;
      recipientUserId?: number;
      message: { type: 'text'; content: string } | { type: 'action'; action: SupportChatActionName; meta: SupportChatActionMeta };
    }
  | {
      recipientUserId: number;
      message: { type: 'text'; content: string } | { type: 'action'; action: SupportChatActionName; meta: SupportChatActionMeta };
    }
  | {
      message: { type: 'text'; content: string } | { type: 'action'; action: SupportChatActionName; meta: SupportChatActionMeta };
    };

export type ReceiveMessagePayload = {
  conversationId: number;
  message: SupportChatMessage;
};

