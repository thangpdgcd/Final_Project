import { create } from 'zustand';
import type { ChatMessage, Conversation, ReceiveMessagePayload } from '../types';

type ConnectionState = {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
};

type ChatState = {
  connection: ConnectionState;
  conversations: Conversation[];
  loadingConversations: boolean;
  selectedRoomId: string | null;
  messagesByRoomId: Record<string, ChatMessage[]>;
  loadingMessagesByRoomId: Record<string, boolean>;
  loadedRooms: Record<string, true>;
  joinedRooms: Record<string, true>;

  setConnectionStatus: (status: ConnectionState['status']) => void;
  setLoadingConversations: (loading: boolean) => void;
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conv: Conversation) => void;
  selectRoom: (roomId: string) => void;
  markJoined: (roomId: string) => void;
  appendMessage: (payload: ReceiveMessagePayload, opts?: { incrementUnreadIfNotSelected?: boolean }) => void;
  setRoomLoading: (roomId: string, loading: boolean) => void;
  setRoomMessages: (roomId: string, messages: ChatMessage[]) => void;
  markRoomLoaded: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
};

const upsertConversationInternal = (list: Conversation[], conv: Conversation) => {
  const idx = list.findIndex((c) => c.roomId === conv.roomId);
  if (idx === -1) return [conv, ...list];
  const next = [...list];
  next[idx] = { ...next[idx], ...conv };
  return next;
};

export const useChatStore = create<ChatState>((set, get) => ({
  connection: { status: 'idle' },
  conversations: [],
  loadingConversations: false,
  selectedRoomId: null,
  messagesByRoomId: {},
  loadingMessagesByRoomId: {},
  loadedRooms: {},
  joinedRooms: {},

  setConnectionStatus: (status) => set({ connection: { status } }),

  setLoadingConversations: (loading) => set({ loadingConversations: loading }),

  setConversations: (conversations) =>
    set((state) => {
      const selectedRoomId =
        state.selectedRoomId && conversations.some((c) => c.roomId === state.selectedRoomId)
          ? state.selectedRoomId
          : conversations[0]?.roomId ?? null;
      return { conversations, selectedRoomId };
    }),

  upsertConversation: (conv) =>
    set((state) => ({
      conversations: upsertConversationInternal(state.conversations, conv),
    })),

  selectRoom: (roomId) =>
    set((state) => ({
      selectedRoomId: roomId,
      conversations: state.conversations.map((c) =>
        c.roomId === roomId ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  markJoined: (roomId) =>
    set((state) => ({
      joinedRooms: { ...state.joinedRooms, [roomId]: true },
    })),

  appendMessage: (payload, opts) => {
    const { roomId, message } = payload;
    const selectedRoomId = get().selectedRoomId;
    const shouldIncrementUnread =
      opts?.incrementUnreadIfNotSelected !== false && selectedRoomId !== roomId;

    set((state) => {
      const existing = state.messagesByRoomId[roomId] ?? [];
      const alreadyHas = existing.some((m) => String(m.id) === String(message.id));
      const nextMessages = alreadyHas ? existing : [...existing, message];
      const preview =
        message.type === 'text'
          ? message.text
          : message.action?.title
            ? `[Action] ${message.action.title}`
            : '[Action]';

      const currentUnread = state.conversations.find((c) => c.roomId === roomId)?.unreadCount ?? 0;
      const nextUnread = shouldIncrementUnread ? currentUnread + 1 : 0;

      return {
        messagesByRoomId: { ...state.messagesByRoomId, [roomId]: nextMessages },
        conversations: upsertConversationInternal(state.conversations, {
          roomId,
          title: state.conversations.find((c) => c.roomId === roomId)?.title ?? roomId,
          lastMessagePreview: preview,
          unreadCount: nextUnread,
        }),
      };
    });
  },

  setRoomLoading: (roomId, loading) =>
    set((state) => ({
      loadingMessagesByRoomId: { ...state.loadingMessagesByRoomId, [roomId]: loading },
    })),

  setRoomMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoomId: { ...state.messagesByRoomId, [roomId]: messages },
    })),

  markRoomLoaded: (roomId) =>
    set((state) => ({
      loadedRooms: { ...state.loadedRooms, [roomId]: true },
    })),

  clearUnread: (roomId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.roomId === roomId ? { ...c, unreadCount: 0 } : c,
      ),
    })),
}));

