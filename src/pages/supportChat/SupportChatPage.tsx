import React, { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useAuth } from '@/store/auth/AuthContext';
import { supportChatApi } from '@/features/supportChat/api/supportChat.api';
import { useSupportChatStore } from '@/features/supportChat/store/useSupportChatStore';
import { useSupportChatConnection } from '@/hooks/supportChat/useSupportChatConnection';
import { useSupportChatConversations } from '@/hooks/supportChat/useSupportChatConversations';
import { useSupportChatMessages } from '@/hooks/supportChat/useSupportChatMessages';
import { ConversationSidebar } from '@/pages/supportChat/components/ConversationSidebar';
import { MessageThread } from '@/pages/supportChat/components/MessageThread';
import { MessageComposer } from '@/pages/supportChat/components/MessageComposer';
import type { SupportChatMessage } from '@/features/supportChat/types';
import { StaffJoinById } from '@/pages/supportChat/components/StaffJoinById';

const makeClientId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const SupportChatPage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const { user, isAuthenticated } = useAuth();
  const enabled = isAuthenticated && Boolean(user?.user_ID);

  useSupportChatConnection({ enabled });
  useSupportChatConversations({ enabled });

  const conversations = useSupportChatStore((s) => s.conversations);
  const loadingConversations = useSupportChatStore((s) => s.loadingConversations);
  const selectedConversationId = useSupportChatStore((s) => s.selectedConversationId);
  const selectConversation = useSupportChatStore((s) => s.selectConversation);
  const upsertConversation = useSupportChatStore((s) => s.upsertConversation);

  const messages = useSupportChatStore((s) =>
    selectedConversationId ? s.messagesByConversationId[selectedConversationId] ?? [] : [],
  );
  const loadingMessages = useSupportChatStore((s) =>
    selectedConversationId ? Boolean(s.loadingMessagesByConversationId[selectedConversationId]) : false,
  );

  useSupportChatMessages({ enabled, conversationId: selectedConversationId });

  const myUserId = user?.user_ID ?? 0;

  const sending = useMemo(
    () => messages.some((m) => m.optimistic?.status === 'sending'),
    [messages],
  );

  const upsertOptimistic = useSupportChatStore((s) => s.upsertOptimistic);
  const markOptimisticFailed = useSupportChatStore((s) => s.markOptimisticFailed);
  const appendIncoming = useSupportChatStore((s) => s.appendIncoming);
  const reconcileOptimisticIfMatch = useSupportChatStore((s) => s.reconcileOptimisticIfMatch);
  const clearUnread = useSupportChatStore((s) => s.clearUnread);

  const onSend = useCallback(
    async (content: string) => {
      if (!enabled) return;
      if (!selectedConversationId) return;
      if (!content.trim()) return;

      const clientId = makeClientId();
      const optimistic: SupportChatMessage = {
        id: clientId,
        conversationId: selectedConversationId,
        type: 'text',
        content,
        sender: { userId: myUserId, name: user?.name ?? `User ${myUserId}` },
        createdAt: Date.now(),
        optimistic: { clientId, status: 'sending' },
      };

      upsertOptimistic(optimistic);

      try {
        const saved = await supportChatApi.postMessage({
          conversationId: selectedConversationId,
          type: 'text',
          content,
        });

        if (saved) {
          reconcileOptimisticIfMatch(saved);
          appendIncoming(
            { conversationId: saved.conversationId, message: saved },
            { incrementUnreadIfNotSelected: false },
          );
        }
      } catch (e: unknown) {
        markOptimisticFailed(selectedConversationId, clientId);
        messageApi.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      }
    },
    [
      appendIncoming,
      enabled,
      markOptimisticFailed,
      messageApi,
      myUserId,
      reconcileOptimisticIfMatch,
      selectedConversationId,
      upsertOptimistic,
      user?.name,
    ],
  );

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <div className="mx-auto w-full max-w-[1200px] px-3 py-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="grid h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-[360px_1fr]">
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              loading={loadingConversations}
              onSelect={(id) => {
                selectConversation(id);
                clearUnread(id);
              }}
              staffJoinSlot={
                <StaffJoinById
                  disabled={!enabled}
                  onJoin={(id) => {
                    upsertConversation({ conversationId: id, title: `Conversation ${id}` });
                    selectConversation(id);
                    clearUnread(id);
                  }}
                />
              }
            />

            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-white/10 bg-black/40">
                <div className="text-sm font-semibold text-zinc-100">
                  {selectedConversationId ? `Conversation #${selectedConversationId}` : 'Support chat'}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {enabled ? 'Connected via realtime updates.' : 'Please login to use support chat.'}
                </div>
              </div>

              <MessageThread myUserId={myUserId} messages={messages} loading={loadingMessages} />
              <MessageComposer
                disabled={!enabled || !selectedConversationId}
                sending={sending}
                onSend={onSend}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChatPage;

