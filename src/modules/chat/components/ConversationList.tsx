import React, { useMemo, useState } from 'react';
import { Input } from 'antd';
import { Search } from 'lucide-react';
import type { Conversation } from '../types';
import { isAdmin } from '../utils/role';
import { useAuth } from '@/store/AuthContext';

type Props = {
  conversations: Conversation[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  onAddRoom?: (roomId: string) => void;
};

export const ConversationList: React.FC<Props> = ({
  conversations,
  selectedRoomId,
  onSelect,
  onAddRoom,
}) => {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [query, setQuery] = useState('');
  const [roomInput, setRoomInput] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q) || c.roomId.toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <div className="h-full flex flex-col border-r border-white/10">
      <div className="p-3 space-y-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          prefix={<Search size={16} />}
          allowClear
        />

        {admin && onAddRoom ? (
          <Input.Search
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Join room by id (admin)"
            enterButton="Join"
            onSearch={(value) => {
              const roomId = String(value ?? '').trim();
              if (!roomId) return;
              onAddRoom(roomId);
              setRoomInput('');
            }}
          />
        ) : null}
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="px-2 py-3 text-xs text-zinc-400">No conversations</div>
        ) : (
          <div className="space-y-1">
            {filtered.map((c) => {
              const selected = c.roomId === selectedRoomId;
              return (
                <button
                  key={c.roomId}
                  type="button"
                  onClick={() => onSelect(c.roomId)}
                  className={[
                    'w-full text-left rounded-xl px-3 py-2 transition border',
                    selected
                      ? 'bg-white/10 border-white/15'
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-100 truncate">{c.title}</div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {c.lastMessagePreview ?? 'No messages yet'}
                      </div>
                    </div>
                    {(c.unreadCount ?? 0) > 0 ? (
                      <div className="shrink-0 mt-0.5 rounded-full bg-[#d6c59a] text-black text-[11px] font-bold px-2 py-0.5">
                        {c.unreadCount}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

