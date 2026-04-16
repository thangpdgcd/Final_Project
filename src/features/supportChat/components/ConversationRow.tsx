import React, { useMemo } from 'react';
import type { SupportChatConversation } from '../types';

const formatTime = (ts?: number) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: '2-digit' });
};

type Props = {
  conversation: SupportChatConversation;
  selected: boolean;
  onClick: () => void;
};

export const ConversationRow: React.FC<Props> = ({ conversation, selected, onClick }) => {
  const initials = useMemo(() => {
    const t = (conversation.title ?? '').trim();
    if (!t) return '?';
    const parts = t.split(/\s+/).slice(0, 2);
    return parts.map((p) => p.slice(0, 1).toUpperCase()).join('');
  }, [conversation.title]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left rounded-2xl px-3 py-2 transition border',
        selected ? 'bg-white/10 border-white/15' : 'border-transparent hover:bg-white/5 hover:border-white/10',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {conversation.avatarUrl ? (
          <img
            src={conversation.avatarUrl}
            alt={conversation.title}
            className="h-10 w-10 rounded-full object-cover border border-white/10"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 grid place-items-center text-xs font-bold text-zinc-100">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-100 truncate">{conversation.title}</div>
              <div className="text-[11px] text-zinc-400 truncate">{conversation.lastMessagePreview ?? 'No messages yet'}</div>
            </div>
            <div className="shrink-0 text-[10px] text-zinc-400 mt-0.5">{formatTime(conversation.lastMessageAt)}</div>
          </div>
        </div>

        {conversation.unreadCount > 0 ? (
          <div className="shrink-0 rounded-full bg-[#d6c59a] text-black text-[11px] font-bold px-2 py-0.5">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </div>
        ) : null}
      </div>
    </button>
  );
};

