import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SupportChatMessage } from '../types';
import { ThreadSkeleton } from './Skeletons';

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

type Props = {
  myUserId: number;
  messages: SupportChatMessage[];
  loading: boolean;
};

export const MessageThread: React.FC<Props> = ({ myUserId, messages, loading }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [autoStick, setAutoStick] = useState(true);

  const sorted = useMemo(() => [...messages].sort((a, b) => a.createdAt - b.createdAt), [messages]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setAutoStick(distanceToBottom < 120);
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll as any);
  }, []);

  useEffect(() => {
    if (!autoStick) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [autoStick, sorted.length]);

  if (loading) return <ThreadSkeleton />;

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-2">
      {sorted.length === 0 ? (
        <div className="text-sm text-zinc-400">No messages yet.</div>
      ) : (
        sorted.map((m) => {
          const mine = (m.sender?.userId ?? 0) === myUserId;
          const bubbleBase =
            'max-w-[720px] rounded-2xl px-3 py-2 border text-sm leading-relaxed whitespace-pre-wrap break-words';
          const bubble = mine
            ? `${bubbleBase} bg-[#d6c59a] text-black border-black/10 rounded-br-md`
            : `${bubbleBase} bg-white/5 text-zinc-100 border-white/10 rounded-bl-md`;

          const metaText =
            m.type === 'text'
              ? m.content
              : `Action: ${m.action}\n${JSON.stringify(m.meta, null, 2)}`;

          return (
            <div key={String(m.id) + (m.optimistic?.clientId ?? '')} className={mine ? 'flex justify-end' : 'flex justify-start'}>
              <div>
                <div className={bubble}>{metaText}</div>
                <div className={mine ? 'mt-1 text-[10px] text-right text-zinc-500' : 'mt-1 text-[10px] text-zinc-500'}>
                  {formatTime(m.createdAt)}
                  {m.optimistic?.status === 'sending' ? ' · Sending…' : null}
                  {m.optimistic?.status === 'failed' ? ' · Failed' : null}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
};

