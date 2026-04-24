import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X, Zap } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthUser, selectIsAuthenticated } from '@/redux/selectors';
import { useSupportWidgetConnection } from '@/hooks/customerSupportWidget/useSupportWidgetConnection';
import { useSupportWidgetMessages } from '@/hooks/customerSupportWidget/useSupportWidgetMessages';
import { useSupportWidgetStore } from '@/features/customerSupportWidget/store/useSupportWidgetStore';
import { supportWidgetEvents } from '@/features/customerSupportWidget/socket/supportWidget.socket';
import { chatEvents } from '@/features/chat/socket/chatEvents';

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

  const statusUi = useMemo(() => {
    if (connectionStatus === 'connected')
      return { label: 'Online', dot: 'bg-emerald-400', pill: 'bg-emerald-500/12 text-emerald-200' };
    if (connectionStatus === 'connecting')
      return { label: 'Connecting…', dot: 'bg-amber-400', pill: 'bg-amber-500/12 text-amber-200' };
    if (connectionStatus === 'error')
      return { label: 'Error', dot: 'bg-rose-400', pill: 'bg-rose-500/12 text-rose-200' };
    return { label: 'Offline', dot: 'bg-zinc-400', pill: 'bg-white/10 text-white/70' };
  }, [connectionStatus]);

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
        // Prefer `chat:message` so staff app (StaffChatPage) receives the same event stream.
        // Fallback: also emit legacy `send_message` for older backends.
        const staffUserId = Number(s.staffUserId ?? 0) || undefined;
        const payload: any = {
          message: { type: 'text', content: text },
          ...(cid > 0 ? { conversationId: cid, roomId: String(cid) } : null),
          ...(staffUserId ? { recipientUserId: staffUserId } : null),
        };

        chatEvents.sendChatMessage(payload, (ack: any) => {
          const ackCid = Number(ack?.conversationId ?? ack?.roomId ?? 0) || 0;
          if (ackCid > 0) {
            const st = useSupportWidgetStore.getState();
            st.setConversationId(ackCid);
            // join immediately so the next staff reply is realtime
            supportWidgetEvents.joinRoom({ conversationId: ackCid } as any);
          }
          resolve();
        });

        // legacy emit (no-op if server ignores)
        try {
          supportWidgetEvents.sendMessage(
            { conversationId: cid > 0 ? cid : undefined, message: { type: 'text', content: text } } as any,
            undefined,
          );
        } catch {
          // ignore
        }
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
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00A2FF] to-[#2563EB] text-white shadow-[0_18px_48px_rgba(0,0,0,0.32)] ring-1 ring-white/10 hover:brightness-110 transition outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          aria-label="Open support chat"
        >
          <span className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            <MessageCircle size={21} strokeWidth={2.25} />
          </span>
          {badge ? (
            <span className="absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full bg-black px-1 text-xs font-bold text-white border border-white/10">
              {badge}
            </span>
          ) : null}
        </button>
      ) : null}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mt-3 w-[92vw] max-w-[380px] h-[62vh] max-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0a08]/80 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-extrabold tracking-tight text-white">Support</div>
                  <span
                    className={[
                      'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold',
                      statusUi.pill,
                    ].join(' ')}
                    aria-label={`Status: ${statusUi.label}`}
                  >
                    <span className={['h-2 w-2 rounded-full', statusUi.dot].join(' ')} />
                    {statusUi.label}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-white/55">
                  {connectionStatus === 'connected' ? 'Active now • replies are realtime' : 'Reconnecting when available'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Visual “active” affordance: forces a reconnect attempt.
                  supportWidgetEvents.joinRoom(
                    conversationId ? ({ conversationId } as any) : ({ recipientUserId: myUserId } as any),
                    undefined,
                  );
                }}
                className={[
                  'hidden sm:inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-bold',
                  'border-white/10 bg-white/5 text-white/85 hover:bg-white/8',
                  'transition active:translate-y-[0.5px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0',
                ].join(' ')}
                title="Refresh connection"
              >
                <Zap size={15} className="text-amber-300" />
                Active
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="h-[calc(62vh-7.05rem)] max-h-[calc(560px-7.05rem)] overflow-y-auto px-3.5 py-3">
              <div className="space-y-2">
                {messages.map((m) => {
                  const mine = Number(m.sender?.userId ?? 0) === myUserId;
                  const isFailed = m.optimistic?.status === 'failed';
                  return (
                    <div key={String(m.id)} className={mine ? 'text-right' : 'text-left'}>
                      <div
                        className={[
                          'inline-block max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-5 shadow-[0_16px_40px_rgba(0,0,0,0.25)]',
                          mine
                            ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black'
                            : 'bg-white/8 text-white border border-white/10',
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

            <div className="px-2.5 py-1">
              <div className="flex items-center gap-2">
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
                  className="min-h-[40px] flex-1 self-center resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] leading-5 text-white/90 outline-none placeholder:text-white/35 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/30"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-black shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[0.5px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  disabled={!draft.trim()}
                  aria-label="Send"
                >
                  <Send size={17} />
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

