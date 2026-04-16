export type SupportWidgetMessageType = 'text' | 'action';

export type SupportWidgetUser = {
  userId: number;
  name: string;
  avatarUrl?: string;
};

export type SupportWidgetConversation = {
  conversationId: number;
  title: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  participants?: Array<{
    userId: number;
    roleAtJoin?: string;
  }>;
};

export type SupportWidgetMessageBase = {
  id: number | string;
  conversationId: number;
  sender?: SupportWidgetUser;
  createdAt: number;
  optimistic?: {
    clientId: string;
    status: 'sending' | 'sent' | 'failed';
  };
};

export type SupportWidgetTextMessage = SupportWidgetMessageBase & {
  type: 'text';
  content: string;
};

export type SupportWidgetActionMessage = SupportWidgetMessageBase & {
  type: 'action';
  action: string;
  meta?: unknown;
};

export type SupportWidgetMessage = SupportWidgetTextMessage | SupportWidgetActionMessage;

export type JoinRoomPayload = { conversationId: number } | Record<string, never>;

export type SendMessagePayload =
  | {
      conversationId: number;
      recipientUserId?: number;
      message: { type: 'text'; content: string } | { type: 'action'; action: string; meta?: unknown };
    }
  | {
      recipientUserId: number;
      message: { type: 'text'; content: string } | { type: 'action'; action: string; meta?: unknown };
    }
  | {
      message: { type: 'text'; content: string } | { type: 'action'; action: string; meta?: unknown };
    };

export type ReceiveMessagePayload = {
  conversationId: number;
  message: SupportWidgetMessage;
};

