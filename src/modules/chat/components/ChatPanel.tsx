import React, { useMemo } from 'react';
import { Badge } from 'antd';
import type { Conversation, ChatMessage } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

type Props = {
  conversation: Conversation | null;
  messages: ChatMessage[];
  myUserId: string;
  connected: boolean;
  onSendText: (text: string) => void;
};

export const ChatPanel: React.FC<Props> = ({
  conversation,
  messages,
  myUserId,
  connected,
  onSendText,
}) => {
  const title = useMemo(() => conversation?.title ?? 'Select a conversation', [conversation]);
  const subtitle = useMemo(() => (connected ? 'Connected' : 'Offline'), [connected]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm font-bold text-zinc-100 truncate">{title}</div>
          <div className="text-[11px] text-zinc-400">{subtitle}</div>
        </div>
        <Badge
          color={connected ? 'green' : 'red'}
          text={connected ? 'live' : 'down'}
        />
      </div>

      {conversation ? (
        <>
          <MessageList messages={messages} myUserId={myUserId} />
          <MessageInput disabled={!connected} onSend={onSendText} />
        </>
      ) : (
        <div className="flex-1 grid place-items-center text-sm text-zinc-400">
          Choose a conversation from the left.
        </div>
      )}
    </div>
  );
};

