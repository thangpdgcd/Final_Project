import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthUser, selectIsAuthenticated } from '@/redux/selectors';
import { useSupportWidgetConnection } from '@/hooks/customerSupportWidget/useSupportWidgetConnection';
import { useSupportWidgetMessages } from '@/hooks/customerSupportWidget/useSupportWidgetMessages';
import { useSupportWidgetStore } from '@/features/customerSupportWidget/store/useSupportWidgetStore';
import { supportWidgetEvents } from '@/features/customerSupportWidget/socket/supportWidget.socket';

const CustomerSupportWidget: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const myUserId = Number((user as any)?.user_ID ?? 0);

  const isOpen = useSupportWidgetStore((s) => s.isOpen);
  const unreadCount = useSupportWidgetStore((s) => s.unreadCount);
  const connectionStatus = useSupportWidgetStore((s) => s.connectionStatus);
  const conversationId = useSupportWidgetStore((s) => s.conversationId);
  const messages = useSupportWidgetStore((s) => s.messages);
  const setOpen = useSupportWidgetStore((s) => s.setOpen);

  const enabled = Boolean(isAuthenticated && myUserId > 0);

  useSupportWidgetConnection({ enabled });
  useSupportWidgetMessages({ enabled: enabled && isOpen, conversationId: conversationId ?? null });

  const [draft, setDraft] = useState('');
  const sendingRef = useRef(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const badge = useMemo(() => {
    if (!unreadCount) return '';
    return unreadCount > 99 ? '99+' : String(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    listEndRef.current?.scrollIntoView({ block: 'end' });
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    if (!enabled) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    const cid = Number(conversationId ?? 0) || 0;
    const s = useSupportWidgetStore.getState();
    const safeCid = cid > 0 ? cid : Date.now(); // client-only temp until server assigns one
    if (cid <= 0) s.setConversationId(safeCid);

    const { clientId } = s.appendOptimisticText(safeCid, myUserId, text);
    setDraft('');

    try {
      await new Promise<void>((resolve) => {
        supportWidgetEvents.sendMessage(
          {
            conversationId: cid > 0 ? cid : undefined,
            message: { type: 'text', content: text },
          } as any,
          () => {
            // backend acks vary; we rely on realtime reconciliation, but mark as sent to reduce UI anxiety
            resolve();
          },
        );
      });
      useSupportWidgetStore.getState().markOptimisticSent(clientId);
    } catch {
      useSupportWidgetStore.getState().markOptimisticFailed(clientId);
    } finally {
      sendingRef.current = false;
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--gold)] text-[color:var(--coffee-brown)] shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:brightness-95 transition"
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {badge && !isOpen && (
          <span className="absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full bg-black px-1 text-xs font-bold text-[color:var(--gold)] border border-white/10">
            {badge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mt-3 w-[92vw] max-w-[420px] h-[68vh] max-h-[600px] overflow-hidden rounded-2xl border border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 px-4 py-3 dark:border-stone-800/70">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">
                  Support
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {connectionStatus === 'connected'
                    ? 'Online'
                    : connectionStatus === 'connecting'
                      ? 'Connecting…'
                      : connectionStatus === 'error'
                        ? 'Connection error'
                        : 'Offline'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800/60"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[calc(68vh-7.25rem)] max-h-[calc(600px-7.25rem)] overflow-y-auto px-4 py-3">
              <div className="space-y-2">
                {messages.map((m) => {
                  const mine = Number(m.sender?.userId ?? 0) === myUserId;
                  const isFailed = m.optimistic?.status === 'failed';
                  return (
                    <div key={String(m.id)} className={mine ? 'text-right' : 'text-left'}>
                      <div
                        className={[
                          'inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                          mine
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100',
                          isFailed ? 'ring-2 ring-red-400' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {m.type === 'text' ? m.content : `[Action] ${m.action}`}
                      </div>
                    </div>
                  );
                })}
                <div ref={listEndRef} />
              </div>
            </div>

            <div className="border-t border-stone-200/60 px-3 py-3 dark:border-stone-800/70">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Type a message…"
                  className="min-h-[42px] flex-1 resize-none rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-orange-400 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
                  disabled={!draft.trim()}
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSupportWidget;

