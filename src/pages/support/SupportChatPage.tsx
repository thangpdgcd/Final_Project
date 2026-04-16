import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Badge } from 'antd';
import { Info, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { ConversationSidebar } from '@/features/supportChat/components/ConversationSidebar';
import { MessageThread } from '@/features/supportChat/components/MessageThread';
import { MessageComposer } from '@/features/supportChat/components/MessageComposer';
import { useSupportChatStore } from '@/features/supportChat/store/useSupportChatStore';
import { useSupportChatConnection } from '@/features/supportChat/hooks/useSupportChatConnection';
import { useSupportChatConversations } from '@/features/supportChat/hooks/useConversations';
import { useSupportChatMessages } from '@/features/supportChat/hooks/useMessages';
import { supportChatEvents } from '@/features/supportChat/socket/supportChat.socket';
import type { SupportChatMessage } from '@/features/supportChat/types';
import { getSupportChatRole } from '@/features/supportChat/utils/role';
import { StaffJoinById } from '@/features/supportChat/components/StaffJoinById';
import { supportChatApi } from '@/features/supportChat/api/supportChat.api';

const SUPPORT_DRAFT_ID = -1;

const createClientId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const makeOptimisticText = (conversationId: number, myUserId: number, content: string): SupportChatMessage => {
  const now = Date.now();
  return {
    id: `optimistic-${now}`,
    conversationId,
    type: 'text',
    content,
    createdAt: now,
    sender: { userId: myUserId, name: 'You' },
    optimistic: { clientId: createClientId(), status: 'sending' },
  };
};

const SupportChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const myUserId = user?.user_ID ?? 0;
  const role = getSupportChatRole(user);
  const isStaff = role === 'staff';

  const [sending, setSending] = useState(false);

  const connectionStatus = useSupportChatStore((s) => s.connectionStatus);
  const conversations = useSupportChatStore((s) => s.conversations);
  const loadingConversations = useSupportChatStore((s) => s.loadingConversations);
  const selectedConversationId = useSupportChatStore((s) => s.selectedConversationId);
  const messagesByConversationId = useSupportChatStore((s) => s.messagesByConversationId);
  const loadingMessagesByConversationId = useSupportChatStore((s) => s.loadingMessagesByConversationId);
  const upsertConversation = useSupportChatStore((s) => s.upsertConversation);
  const selectConversation = useSupportChatStore((s) => s.selectConversation);
  const clearUnread = useSupportChatStore((s) => s.clearUnread);
  const upsertOptimistic = useSupportChatStore((s) => s.upsertOptimistic);
  const markOptimisticFailed = useSupportChatStore((s) => s.markOptimisticFailed);
  const migrateConversation = useSupportChatStore((s) => s.migrateConversation);

  const enabled = Boolean(isAuthenticated && myUserId);

  useSupportChatConversations({ enabled });
  useSupportChatConnection({ enabled });
  useSupportChatMessages({ enabled, conversationId: selectedConversationId });

  const connected = connectionStatus === 'connected';

  const selectedMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return messagesByConversationId[selectedConversationId] ?? [];
  }, [messagesByConversationId, selectedConversationId]);

  const loadingThread = useMemo(() => {
    if (!selectedConversationId) return false;
    return Boolean(loadingMessagesByConversationId[selectedConversationId]);
  }, [loadingMessagesByConversationId, selectedConversationId]);

  const headerText = useMemo(() => {
    if (!enabled) return 'Login required';
    if (selectedConversationId === SUPPORT_DRAFT_ID) return 'Support (connecting…)';
    const selected = selectedConversationId
      ? conversations.find((c) => c.conversationId === selectedConversationId)
      : null;
    return selected?.title ?? 'Support chat';
  }, [conversations, enabled, selectedConversationId]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c.conversationId === selectedConversationId) ?? null;
  }, [conversations, selectedConversationId]);

  const headerAvatar = useMemo(() => {
    const title = (selectedConversation?.title ?? headerText).trim();
    if (!title) return '?';
    const parts = title.split(/\s+/).slice(0, 2);
    return parts.map((p) => p.slice(0, 1).toUpperCase()).join('');
  }, [headerText, selectedConversation?.title]);

  const onContactSupport = () => {
    if (isStaff) return;
    upsertConversation({
      conversationId: SUPPORT_DRAFT_ID,
      title: 'Support',
      unreadCount: 0,
      lastMessagePreview: 'Start a conversation with support',
      lastMessageAt: Date.now(),
    });
    selectConversation(SUPPORT_DRAFT_ID);
    clearUnread(SUPPORT_DRAFT_ID);
    try {
      supportChatEvents.joinRoom({});
    } catch {
      // connection hook will manage socket lifecycle
    }
  };

  const onSelectConversation = (conversationId: number) => {
    selectConversation(conversationId);
    clearUnread(conversationId);
  };

  const onStaffJoinById = (conversationId: number) => {
    if (!enabled) return;
    if (!conversationId || conversationId <= 0) return;
    if (!connected) {
      toast.error('Chat is offline. Please try again in a moment.');
      return;
    }

    upsertConversation({
      conversationId,
      title: `Conversation ${conversationId}`,
      unreadCount: 0,
      lastMessagePreview: 'Joined by ID',
      lastMessageAt: Date.now(),
    });
    selectConversation(conversationId);
    clearUnread(conversationId);
    supportChatEvents.joinRoom({ conversationId });
  };

  const onSend = async (content: string) => {
    if (!enabled) {
      toast.error('Please login to chat.');
      return;
    }
    if (!connected) {
      toast.error('Chat is offline. Please try again in a moment.');
      return;
    }

    const conversationId = selectedConversationId ?? SUPPORT_DRAFT_ID;
    if (!conversationId) return;
    if (isStaff && conversationId === SUPPORT_DRAFT_ID) {
      toast.error('Please select a conversation first.');
      return;
    }

    const optimistic = makeOptimisticText(conversationId, myUserId, content);
    upsertOptimistic(optimistic);
    upsertConversation({
      conversationId,
      lastMessagePreview: content,
      lastMessageAt: optimistic.createdAt,
      unreadCount: 0,
    });

    setSending(true);
    try {
      if (conversationId === SUPPORT_DRAFT_ID) {
        supportChatEvents.sendMessage({ message: { type: 'text', content } });
      } else {
        supportChatEvents.sendMessage({ conversationId, message: { type: 'text', content } });
      }
    } catch (err: any) {
      markOptimisticFailed(conversationId, optimistic.optimistic!.clientId);
      try {
        const saved =
          conversationId === SUPPORT_DRAFT_ID
            ? await supportChatApi.postMessage({ type: 'text', content })
            : await supportChatApi.postMessage({ conversationId, type: 'text', content });
        if (saved) {
          useSupportChatStore.getState().reconcileOptimisticIfMatch(saved);
          useSupportChatStore.getState().appendIncoming({ conversationId: saved.conversationId, message: saved }, { incrementUnreadIfNotSelected: false });
        }
      } catch (restErr: any) {
        toast.error(restErr?.message ? String(restErr.message) : err?.message ? String(err.message) : 'Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  // Draft migration: if a real conversation arrives while the draft is selected,
  // we can adopt it by moving messages over. This is triggered by incoming messages
  // via store reconcile + append, so we do a lightweight heuristic here too.
  const maybeAdoptDraft = () => {
    if (selectedConversationId !== SUPPORT_DRAFT_ID) return;
    const candidates = conversations.filter((c) => c.conversationId !== SUPPORT_DRAFT_ID);
    if (candidates.length === 0) return;
    const newest = candidates[0];
    migrateConversation(SUPPORT_DRAFT_ID, newest.conversationId);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4">
      <div className="mx-auto max-w-[1100px] h-[78vh] min-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
        <div className="h-full grid grid-cols-[340px_1fr]">
          <ConversationSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            loading={loadingConversations}
            onSelect={(id) => {
              onSelectConversation(id);
              maybeAdoptDraft();
            }}
            onContactSupport={isStaff ? undefined : onContactSupport}
            staffJoinSlot={isStaff ? <StaffJoinById disabled={!enabled || !connected} onJoin={onStaffJoinById} /> : undefined}
          />

          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="min-w-0 flex items-center gap-3">
                {selectedConversation?.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={selectedConversation.avatarUrl}
                      alt={headerText}
                      className="h-9 w-9 rounded-full object-cover border border-white/10"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={[
                        'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/60',
                        connected ? 'bg-green-500' : 'bg-zinc-500',
                      ].join(' ')}
                    />
                  </div>
                ) : (
                  <div className="relative h-9 w-9 rounded-full bg-white/10 border border-white/10 grid place-items-center text-xs font-bold text-zinc-100">
                    {headerAvatar}
                    <span
                      className={[
                        'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/60',
                        connected ? 'bg-green-500' : 'bg-zinc-500',
                      ].join(' ')}
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-100 truncate">{headerText}</div>
                  <div className="text-[11px] text-zinc-400">{connected ? 'Active now' : enabled ? 'Offline' : 'Not authenticated'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge color={connected ? 'green' : 'red'} text={connected ? 'live' : 'down'} />
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10"
                  aria-label="Info"
                  title="Info"
                >
                  <Info size={18} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10"
                  aria-label="More"
                  title="More"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {selectedConversationId ? (
              <>
                <MessageThread myUserId={myUserId} messages={selectedMessages} loading={loadingThread} />
                <MessageComposer
                  disabled={!connected || (isStaff && selectedConversationId === SUPPORT_DRAFT_ID)}
                  sending={sending}
                  onSend={onSend}
                />
              </>
            ) : (
              <div className="flex-1 grid place-items-center text-sm text-zinc-400">
                {isStaff ? 'Select a conversation from the left to start.' : 'Choose a conversation from the left, or click “Contact support”.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChatPage;

