import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ReceiveMessagePayload, SupportWidgetConversation, SupportWidgetMessage } from '../types';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type SupportWidgetState = {
  hasHydrated: boolean;
  isOpen: boolean;
  unreadCount: number;
  connectionStatus: ConnectionStatus;

  conversationId: number | null;
  joinedConversationId: number | null;
  joiningConversationId: number | null;
  hasAutoAssigned: boolean;
  lastKnownConversation?: SupportWidgetConversation | null;
  staffUserId: number | null;

  messages: SupportWidgetMessage[];
  loadingMessages: boolean;
  loadedConversationId: number | null;

  setOpen: (open: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  clearUnread: () => void;
  incrementUnread: () => void;

  setConnectionStatus: (status: ConnectionStatus) => void;
  setConversationId: (conversationId: number | null) => void;
  setJoinedConversationId: (conversationId: number | null) => void;
  setJoiningConversationId: (conversationId: number | null) => void;
  setHasAutoAssigned: (v: boolean) => void;
  setLastKnownConversation: (c: SupportWidgetConversation | null) => void;
  setStaffUserId: (userId: number | null) => void;

  setMessages: (messages: SupportWidgetMessage[]) => void;
  setLoadingMessages: (loading: boolean) => void;
  setLoadedConversationId: (conversationId: number | null) => void;

  appendIncoming: (payload: ReceiveMessagePayload) => void;
  appendOptimisticText: (
    conversationId: number,
    myUserId: number,
    content: string,
  ) => { clientId: string; tempId: string };
  markOptimisticSent: (clientId: string) => void;
  markOptimisticFailed: (clientId: string) => void;
  reconcileOptimisticIfMatch: (incoming: SupportWidgetMessage) => boolean;
};

const createClientId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const makePreview = (m?: SupportWidgetMessage): string => {
  if (!m) return '';
  if (m.type === 'text') return m.content;
  return `[Action] ${m.action}`;
};

export const useSupportWidgetStore = create<SupportWidgetState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      isOpen: false,
      unreadCount: 0,
      connectionStatus: 'idle',

      conversationId: null,
      joinedConversationId: null,
      joiningConversationId: null,
      hasAutoAssigned: false,
      lastKnownConversation: null,
      staffUserId: null,

      messages: [],
      loadingMessages: false,
      loadedConversationId: null,

      setOpen: (open) =>
        set((state) => ({
          isOpen: open,
          unreadCount: open ? 0 : state.unreadCount,
        })),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      clearUnread: () => set({ unreadCount: 0 }),
      incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setConversationId: (conversationId) => set({ conversationId }),
      setJoinedConversationId: (conversationId) => set({ joinedConversationId: conversationId }),
      setJoiningConversationId: (conversationId) => set({ joiningConversationId: conversationId }),
      setHasAutoAssigned: (v) => set({ hasAutoAssigned: v }),
      setLastKnownConversation: (c) => set({ lastKnownConversation: c }),
      setStaffUserId: (userId) => set({ staffUserId: userId }),

      setMessages: (messages) =>
        set({ messages: [...messages].sort((a, b) => a.createdAt - b.createdAt) }),
      setLoadingMessages: (loading) => set({ loadingMessages: loading }),
      setLoadedConversationId: (conversationId) => set({ loadedConversationId: conversationId }),

      appendIncoming: (payload) => {
        const { conversationId, message } = payload;
        const isOpen = get().isOpen;
        if (!message) return;

        set((state) => {
          const alreadyHas = state.messages.some((m) => String(m.id) === String(message.id));
          const nextMessages = alreadyHas
            ? state.messages
            : [...state.messages, message].sort((a, b) => a.createdAt - b.createdAt);

          return {
            conversationId:
              state.conversationId && state.conversationId > 0 ? state.conversationId : conversationId,
            messages: nextMessages,
            unreadCount: isOpen ? 0 : state.unreadCount + 1,
            lastKnownConversation: state.lastKnownConversation
              ? {
                  ...state.lastKnownConversation,
                  conversationId,
                  lastMessagePreview: makePreview(message),
                  lastMessageAt: message.createdAt,
                }
              : state.lastKnownConversation,
          };
        });
      },

      appendOptimisticText: (conversationId, myUserId, content) => {
        const now = Date.now();
        const clientId = createClientId();
        const tempId = `optimistic-${now}-${clientId}`;
        const optimistic: SupportWidgetMessage = {
          id: tempId,
          conversationId,
          type: 'text',
          content,
          createdAt: now,
          sender: { userId: myUserId, name: 'You' },
          optimistic: { clientId, status: 'sending' as const },
        };

        set((state) => ({
          messages: [...state.messages, optimistic].sort((a, b) => a.createdAt - b.createdAt),
        }));

        return { clientId, tempId };
      },

      markOptimisticFailed: (clientId) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.optimistic?.clientId === clientId
              ? { ...m, optimistic: { ...m.optimistic, status: 'failed' as const } }
              : m,
          ),
        }));
      },

      markOptimisticSent: (clientId) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.optimistic?.clientId === clientId && m.optimistic?.status === 'sending'
              ? { ...m, optimistic: { ...m.optimistic, status: 'sent' as const } }
              : m,
          ),
        }));
      },

      reconcileOptimisticIfMatch: (incoming) => {
        const existing = get().messages;
        if (existing.length === 0) return false;
        if (existing.some((m) => String(m.id) === String(incoming.id))) return false;

        const incomingPreview = makePreview(incoming);
        const incomingSenderId = incoming.sender?.userId ?? null;

        const matchIdx = [...existing].reverse().findIndex((m) => {
          const opt = m.optimistic;
          if (!opt) return false;
          if (opt.status === 'failed') return false;
          const sameType = m.type === incoming.type;
          const sameSender = incomingSenderId ? m.sender?.userId === incomingSenderId : true;
          const sameContent = makePreview(m) === incomingPreview;
          const closeInTime = Math.abs((m.createdAt ?? 0) - (incoming.createdAt ?? 0)) < 30_000;
          return sameType && sameSender && sameContent && closeInTime;
        });

        if (matchIdx === -1) return false;
        const realIdx = existing.length - 1 - matchIdx;

        set((state) => {
          const updated = state.messages;
          const target = updated[realIdx];
          if (!target?.optimistic) return {};
          const next = updated.map((m, i) =>
            i === realIdx
              ? {
                  ...incoming,
                  optimistic: { clientId: target.optimistic!.clientId, status: 'sent' as const },
                }
              : m,
          );
          return { messages: next };
        });
        return true;
      },
    }),
    {
      name: 'supportWidget:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        hasHydrated: s.hasHydrated,
        isOpen: s.isOpen,
        unreadCount: s.unreadCount,
        conversationId: s.conversationId,
        lastKnownConversation: s.lastKnownConversation,
        staffUserId: s.staffUserId,
        messages: s.messages,
        loadedConversationId: s.loadedConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          state.setHasHydrated(true);
        } catch {
          // ignore
        }
      },
    },
  ),
);

