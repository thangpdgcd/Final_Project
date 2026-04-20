import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

type Props = {
  messages: ChatMessage[];
  myUserId: string;
};

export const MessageList: React.FC<Props> = ({ messages, myUserId }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-auto p-3 space-y-2">
      {messages.length === 0 ? (
        <div className="text-xs text-zinc-400">No messages yet.</div>
      ) : (
        messages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={String(m.sender.id) === String(myUserId)} />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};
