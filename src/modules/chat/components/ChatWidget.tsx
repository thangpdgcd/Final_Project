import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { chatEvents } from '../socket/chatEvents';
import { disconnectSocket, getSocket } from '../socket/socketClient';
import type { ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { toChatUserRef } from '../utils/role';
import { ConversationList } from './ConversationList';
import { ChatPanel } from './ChatPanel';
import { useConversations } from '../hooks/useConversations';
import { useRoomMessages } from '../hooks/useRoomMessages';
import { useChatSocket } from '../hooks/useChatSocket';

const createId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

export const ChatWidget: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const conversations = useChatStore((s) => s.conversations);
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);
  const messagesByRoomId = useChatStore((s) => s.messagesByRoomId);
  const upsertConversation = useChatStore((s) => s.upsertConversation);
  const selectRoom = useChatStore((s) => s.selectRoom);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setConnectionStatus = useChatStore((s) => s.setConnectionStatus);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0),
    [conversations],
  );

  const myRef = useMemo(() => {
    if (!user) return null;
    return toChatUserRef(user);
  }, [user]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.roomId === selectedRoomId) ?? null,
    [conversations, selectedRoomId],
  );

  const selectedMessages: ChatMessage[] = useMemo(() => {
    if (!selectedRoomId) return [];
    return messagesByRoomId[selectedRoomId] ?? [];
  }, [messagesByRoomId, selectedRoomId]);

  useConversations({ enabled: Boolean(isAuthenticated) });
  useRoomMessages({ enabled: Boolean(isAuthenticated) });
  useChatSocket({ enabled: isOpen && Boolean(isAuthenticated), myRef });

  const connected = useMemo(() => {
    const s = getSocket();
    return !!s?.connected;
  }, [isOpen]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            if (isOpen) {
              disconnectSocket();
              setConnectionStatus('disconnected');
            }
          }}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6c59a] text-black shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:brightness-95 transition"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
          {unreadTotal > 0 && !isOpen ? (
            <span className="absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full bg-black px-1 text-xs font-bold text-[#d6c59a] border border-white/10">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          ) : null}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mt-3 w-[92vw] max-w-[820px] h-[72vh] max-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
          >
            <div className="h-full grid grid-cols-[320px_1fr]">
              <ConversationList
                conversations={conversations}
                selectedRoomId={selectedRoomId}
                onSelect={(roomId) => {
                  selectRoom(roomId);
                }}
                onAddRoom={(roomId) => {
                  upsertConversation({ roomId, title: roomId, unreadCount: 0 });
                  selectRoom(roomId);
                }}
              />

              <ChatPanel
                conversation={selectedConversation}
                messages={selectedMessages}
                myUserId={String(user.user_ID)}
                connected={connected}
                onSendText={(text) => {
                  if (!selectedRoomId || !myRef) return;
                  chatEvents.sendChatMessage(
                    { roomId: selectedRoomId, message: { type: 'text', text } },
                    (ack: any) => {
                      // Prefer server-acknowledged saved message to avoid sender-side duplication.
                      const saved =
                        ack?.message && typeof ack.message === 'object' ? ack.message : ack;
                      if (!saved || typeof saved !== 'object') return;
                      const roomId = String(
                        (saved as any).roomId ?? (saved as any).room_id ?? selectedRoomId,
                      );
                      const message: ChatMessage = {
                        id: String((saved as any).id ?? (saved as any)._id ?? createId()),
                        roomId,
                        type: (saved as any).type === 'action' ? 'action' : 'text',
                        text: String((saved as any).text ?? (saved as any).content ?? text),
                        action: (saved as any).action,
                        sender: ((saved as any).sender as any) ?? myRef,
                        createdAt:
                          typeof (saved as any).createdAt === 'number'
                            ? (saved as any).createdAt
                            : (saved as any).createdAt
                              ? Date.parse(String((saved as any).createdAt)) || Date.now()
                              : Date.now(),
                      };
                      appendMessage({ roomId, message }, { incrementUnreadIfNotSelected: false });
                    },
                  );
                }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
