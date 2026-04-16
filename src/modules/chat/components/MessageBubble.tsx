import React from 'react';
import type { ChatMessage } from '../types';
import { ActionMessageRenderer } from './actions/ActionMessageRenderer';

type Props = {
  message: ChatMessage;
  isMine: boolean;
};

export const MessageBubble: React.FC<Props> = ({ message, isMine }) => {
  const base =
    'max-w-[82%] rounded-2xl px-3 py-2 border shadow-[0_12px_30px_rgba(0,0,0,0.22)]';
  const mine = 'ml-auto bg-[#d6c59a] text-black border-black/10';
  const theirs = 'mr-auto bg-white/5 text-zinc-100 border-white/10';

  return (
    <div className={['flex', isMine ? 'justify-end' : 'justify-start'].join(' ')}>
      <div className={[base, isMine ? mine : theirs].join(' ')}>
        <div className="text-[11px] opacity-70">
          {isMine ? 'You' : message.sender.name}
        </div>
        {message.type === 'text' ? (
          <div className="text-sm whitespace-pre-wrap break-words">{message.text}</div>
        ) : (
          <ActionMessageRenderer message={message} />
        )}
        <div className="mt-1 text-[10px] opacity-60">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

