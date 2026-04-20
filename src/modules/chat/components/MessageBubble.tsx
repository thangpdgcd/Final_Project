import React from 'react';
import type { ChatMessage } from '../types';
import { ActionMessageRenderer } from './actions/ActionMessageRenderer';

type Props = {
  message: ChatMessage;
  isMine: boolean;
  startsGroup?: boolean;
  endsGroup?: boolean;
};

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const MessageBubble: React.FC<Props> = ({
  message,
  isMine,
  startsGroup = true,
  endsGroup = true,
}) => {
  const bubbleBase =
    'max-w-[92%] sm:max-w-[80%] px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] border shadow-[0_10px_26px_rgba(0,0,0,0.25)]';
  const mineColor = 'bg-[#d6c59a] text-black border-black/10';
  const theirColor = 'bg-white/5 text-zinc-100 border-white/10';

  const mineShape = startsGroup
    ? endsGroup
      ? 'rounded-2xl rounded-br-md'
      : 'rounded-2xl rounded-br-lg'
    : endsGroup
      ? 'rounded-2xl rounded-tr-lg rounded-br-md'
      : 'rounded-2xl rounded-tr-[10px] rounded-br-[10px]';

  const theirShape = startsGroup
    ? endsGroup
      ? 'rounded-2xl rounded-bl-md'
      : 'rounded-2xl rounded-bl-lg'
    : endsGroup
      ? 'rounded-2xl rounded-tl-lg rounded-bl-md'
      : 'rounded-2xl rounded-tl-[10px] rounded-bl-[10px]';

  return (
    <div
      className={[
        'flex',
        isMine ? 'justify-end' : 'justify-start',
        startsGroup ? 'mt-3' : 'mt-1.5',
      ].join(' ')}
    >
      {!isMine ? (
        <div className="mr-2 w-8 shrink-0 self-end">
          {endsGroup ? (
            <div className="h-8 w-8 rounded-full border border-white/10 bg-white/10 grid place-items-center text-[11px] font-semibold text-white">
              {(message.sender?.name?.trim()?.[0] ?? 'S').toUpperCase()}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={isMine ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
        {!isMine && startsGroup ? (
          <div className="mb-1 ml-1 text-[12px] font-medium text-zinc-300">
            {message.sender?.name || 'Support'}
          </div>
        ) : null}

        <div
          className={[
            bubbleBase,
            isMine ? mineColor : theirColor,
            isMine ? mineShape : theirShape,
          ].join(' ')}
        >
          {message.type === 'text' ? (
            <div>{message.text}</div>
          ) : (
            <ActionMessageRenderer message={message} />
          )}
        </div>

        {endsGroup ? (
          <div className={isMine ? 'mt-1 text-[10px] text-zinc-500 text-right' : 'mt-1 text-[10px] text-zinc-500'}>
            {formatTime(message.createdAt)}
          </div>
        ) : null}
      </div>
    </div>
  );
};
