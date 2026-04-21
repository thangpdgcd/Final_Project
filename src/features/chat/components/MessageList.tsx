import React, { useEffect, useMemo, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

type Props = {
  messages: ChatMessage[];
  myUserId: string;
};

export const MessageList: React.FC<Props> = ({ messages, myUserId }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(() => {
    return [...messages].sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sorted.length]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3">
      {sorted.length === 0 ? (
        <div className="text-xs text-zinc-400">No messages yet.</div>
      ) : (
        <div className="space-y-0">
          {sorted.map((m, index) => {
            const mine = String(m.sender.id) === String(myUserId);
            const prev = index > 0 ? sorted[index - 1] : null;
            const next = index < sorted.length - 1 ? sorted[index + 1] : null;

            const prevMine = prev ? String(prev.sender.id) === String(myUserId) : null;
            const nextMine = next ? String(next.sender.id) === String(myUserId) : null;
            const gapFromPrev = prev ? Number(m.createdAt) - Number(prev.createdAt) : Number.MAX_SAFE_INTEGER;
            const gapToNext = next ? Number(next.createdAt) - Number(m.createdAt) : Number.MAX_SAFE_INTEGER;

            const startsGroup = !prev || prevMine !== mine || gapFromPrev > 5 * 60_000;
            const endsGroup = !next || nextMine !== mine || gapToNext > 5 * 60_000;

            return (
              <MessageBubble
                key={m.id}
                message={m}
                isMine={mine}
                startsGroup={startsGroup}
                endsGroup={endsGroup}
              />
            );
          })}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
