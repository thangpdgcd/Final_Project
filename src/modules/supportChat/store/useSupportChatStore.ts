import { create } from 'zustand';
import type { ReceiveMessagePayload, SupportChatConversation, SupportChatMessage } from '../types';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type SupportChatState = {
  connectionStatus: ConnectionStatus;
  conversations: SupportChatConversation[];
  loadingConversations: boolean;
  selectedConversationId: number | null;
  messagesByConversationId: Record<number, SupportChatMessage[]>;
  loadingMessagesByConversationId: Record<number, boolean>;
  joinedConversations: Record<number, true>;
  loadedConversations: Record<number, true>;

  setConnectionStatus: (status: ConnectionStatus) => void;
  setLoadingConversations: (loading: boolean) => void;
  setConversations: (conversations: SupportChatConversation[]) => void;
  upsertConversation: (conv: Partial<SupportChatConversation> & { conversationId: number }) => void;
  selectConversation: (conversationId: number) => void;
  clearUnread: (conversationId: number) => void;

  setConversationMessages: (conversationId: number, messages: SupportChatMessage[]) => void;
  setConversationLoading: (conversationId: number, loading: boolean) => void;
  markConversationLoaded: (conversationId: number) => void;
  markConversationJoined: (conversationId: number) => void;

  appendIncoming: (payload: ReceiveMessagePayload, opts?: { incrementUnreadIfNotSelected?: boolean }) => void;
  upsertOptimistic: (message: SupportChatMessage) => void;
  markOptimisticFailed: (conversationId: number, clientId: string) => void;
  reconcileOptimisticIfMatch: (incoming: SupportChatMessage) => void;
  migrateConversation: (fromConversationId: number, toConversationId: number) => void;
};

const upsertConversationInternal = (
  list: SupportChatConversation[],
  patch: Partial<SupportChatConversation> & { conversationId: number },
): SupportChatConversation[] => {
  const idx = list.findIndex((c) => c.conversationId === patch.conversationId);
  if (idx === -1) {
    const next: SupportChatConversation = {
      conversationId: patch.conversationId,
      title: patch.title ?? `Conversation ${patch.conversationId}`,
      avatarUrl: patch.avatarUrl,
      lastMessagePreview: patch.lastMessagePreview,
      lastMessageAt: patch.lastMessageAt,
      unreadCount: patch.unreadCount ?? 0,
    };
    return [next, ...list];
  }
  const next = [...list];
  next[idx] = { ...next[idx], ...patch } as SupportChatConversation;
  return next;
};

const makePreview = (m: SupportChatMessage): string => {
  if (m.type === 'text') return m.content;
  return `[Action] ${m.action}`;
};

const sortConversations = (list: SupportChatConversation[]) => {
  return [...list].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
};

export const useSupportChatStore = create<SupportChatState>((set, get) => ({
  connectionStatus: 'idle',
  conversations: [],
  loadingConversations: false,
  selectedConversationId: null,
  messagesByConversationId: {},
  loadingMessagesByConversationId: {},
  joinedConversations: {},
  loadedConversations: {},

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setLoadingConversations: (loading) => set({ loadingConversations: loading }),

  setConversations: (conversations) =>
    set((state) => {
      const selectedConversationId =
        state.selectedConversationId && conversations.some((c) => c.conversationId === state.selectedConversationId)
          ? state.selectedConversationId
          : conversations[0]?.conversationId ?? null;
      return { conversations: sortConversations(conversations), selectedConversationId };
    }),

  upsertConversation: (patch) =>
    set((state) => ({
      conversations: sortConversations(upsertConversationInternal(state.conversations, patch)),
    })),

  selectConversation: (conversationId) =>
    set((state) => ({
      selectedConversationId: conversationId,
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  setConversationMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversationId: { ...state.messagesByConversationId, [conversationId]: messages },
    })),

  setConversationLoading: (conversationId, loading) =>
    set((state) => ({
      loadingMessagesByConversationId: { ...state.loadingMessagesByConversationId, [conversationId]: loading },
    })),

  markConversationLoaded: (conversationId) =>
    set((state) => ({
      loadedConversations: { ...state.loadedConversations, [conversationId]: true },
    })),

  markConversationJoined: (conversationId) =>
    set((state) => ({
      joinedConversations: { ...state.joinedConversations, [conversationId]: true },
    })),

  appendIncoming: (payload, opts) => {
    const { conversationId, message } = payload;
    const selected = get().selectedConversationId;
    const shouldIncrementUnread = opts?.incrementUnreadIfNotSelected !== false && selected !== conversationId;

    set((state) => {
      const existing = state.messagesByConversationId[conversationId] ?? [];
      const alreadyHas = existing.some((m) => String(m.id) === String(message.id));
      const nextMessages = (alreadyHas ? existing : [...existing, message]).sort((a, b) => a.createdAt - b.createdAt);

      const currentUnread = state.conversations.find((c) => c.conversationId === conversationId)?.unreadCount ?? 0;
      const nextUnread = shouldIncrementUnread ? currentUnread + 1 : 0;

      return {
        messagesByConversationId: { ...state.messagesByConversationId, [conversationId]: nextMessages },
        conversations: sortConversations(
          upsertConversationInternal(state.conversations, {
            conversationId,
            lastMessagePreview: makePreview(message),
            lastMessageAt: message.createdAt,
            unreadCount: nextUnread,
          }),
        ),
      };
    });
  },

  upsertOptimistic: (message) => {
    const conversationId = message.conversationId;
    const clientId = message.optimistic?.clientId;
    if (!clientId) return;

    set((state) => {
      const existing = state.messagesByConversationId[conversationId] ?? [];
      const idx = existing.findIndex((m) => m.optimistic?.clientId === clientId);
      const next = idx === -1 ? [...existing, message] : existing.map((m, i) => (i === idx ? message : m));
      return { messagesByConversationId: { ...state.messagesByConversationId, [conversationId]: next } };
    });
  },

  markOptimisticFailed: (conversationId, clientId) => {
    set((state) => {
      const existing = state.messagesByConversationId[conversationId] ?? [];
      const next = existing.map((m) => {
        if (m.optimistic?.clientId !== clientId) return m;
        return {
          ...m,
          optimistic: { ...m.optimistic, status: 'failed' as const },
        };
      });
      return { messagesByConversationId: { ...state.messagesByConversationId, [conversationId]: next } };
    });
  },

  reconcileOptimisticIfMatch: (incoming) => {
    const conversationId = incoming.conversationId;
    const existing = get().messagesByConversationId[conversationId] ?? [];
    if (existing.length === 0) return;

    const incomingPreview = makePreview(incoming);
    const incomingSenderId = incoming.sender?.userId ?? null;

    const matchIdx = [...existing]
      .reverse()
      .findIndex((m) => {
        const optimistic = m.optimistic;
        if (!optimistic || optimistic.status !== 'sending') return false;
        const sameType = m.type === incoming.type;
        const sameSender = incomingSenderId ? m.sender?.userId === incomingSenderId : true;
        const sameContent = makePreview(m) === incomingPreview;
        const closeInTime = Math.abs((m.createdAt ?? 0) - (incoming.createdAt ?? 0)) < 30_000;
        return sameType && sameSender && sameContent && closeInTime;
      });

    if (matchIdx === -1) return;
    const realIdx = existing.length - 1 - matchIdx;

    set((state) => {
      const updated = state.messagesByConversationId[conversationId] ?? [];
      const target = updated[realIdx];
      if (!target?.optimistic) return {};

      const next = updated.map((m, i) => {
        if (i !== realIdx) return m;
        return {
          ...incoming,
          optimistic: { clientId: m.optimistic!.clientId, status: 'sent' as const },
        };
      });
      return { messagesByConversationId: { ...state.messagesByConversationId, [conversationId]: next } };
    });
  },

  migrateConversation: (fromConversationId, toConversationId) => {
    if (!fromConversationId || !toConversationId) return;
    if (fromConversationId === toConversationId) return;

    set((state) => {
      const fromMessages = state.messagesByConversationId[fromConversationId] ?? [];
      const existingTo = state.messagesByConversationId[toConversationId] ?? [];
      const migrated = fromMessages.map((m) => ({ ...m, conversationId: toConversationId }));
      const nextMessages = [...existingTo, ...migrated].sort((a, b) => a.createdAt - b.createdAt);

      const nextMessagesBy = { ...state.messagesByConversationId };
      delete nextMessagesBy[fromConversationId];
      nextMessagesBy[toConversationId] = nextMessages;

      const nextJoined = { ...state.joinedConversations };
      if (nextJoined[fromConversationId]) {
        delete nextJoined[fromConversationId];
        nextJoined[toConversationId] = true;
      }

      const nextLoaded = { ...state.loadedConversations };
      if (nextLoaded[fromConversationId]) {
        delete nextLoaded[fromConversationId];
        nextLoaded[toConversationId] = true;
      }

      const nextLoadingBy = { ...state.loadingMessagesByConversationId };
      if (nextLoadingBy[fromConversationId]) {
        delete nextLoadingBy[fromConversationId];
      }

      const fromConv = state.conversations.find((c) => c.conversationId === fromConversationId);
      const remaining = state.conversations.filter((c) => c.conversationId !== fromConversationId);
      const withTo = upsertConversationInternal(remaining, {
        conversationId: toConversationId,
        title: fromConv?.title,
        avatarUrl: fromConv?.avatarUrl,
        unreadCount: 0,
      });

      const selectedConversationId =
        state.selectedConversationId === fromConversationId ? toConversationId : state.selectedConversationId;

      return {
        messagesByConversationId: nextMessagesBy,
        joinedConversations: nextJoined,
        loadedConversations: nextLoaded,
        loadingMessagesByConversationId: nextLoadingBy,
        conversations: sortConversations(withTo),
        selectedConversationId,
      };
    });
  },
}));

