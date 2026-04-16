import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { SupportChatConversation } from '../types';
import { ConversationRow } from './ConversationRow';
import { SidebarSkeleton } from './Skeletons';
import { useOnlineStaff } from '../hooks/useOnlineStaff';

type Props = {
  conversations: SupportChatConversation[];
  selectedConversationId: number | null;
  loading: boolean;
  onSelect: (conversationId: number) => void;
  onContactSupport?: () => void;
};

export const ConversationSidebar: React.FC<Props> = ({
  conversations,
  selectedConversationId,
  loading,
  onSelect,
  onContactSupport,
}) => {
  const [query, setQuery] = useState('');
  const { staff } = useOnlineStaff({ enabled: true, pollMs: 15_000 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q) || String(c.conversationId).includes(q));
  }, [conversations, query]);

  return (
    <div className="h-full flex flex-col border-r border-white/10 bg-black/40">
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
          />
        </div>

        {onContactSupport ? (
          <button
            type="button"
            onClick={onContactSupport}
            className="w-full rounded-2xl bg-[#d6c59a] text-black text-sm font-semibold py-2 hover:brightness-95 transition"
          >
            Contact support
          </button>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-200">Staff online</div>
            <div className="text-[11px] text-zinc-400">{staff.length}</div>
          </div>
          {staff.length === 0 ? (
            <div className="mt-2 text-[11px] text-zinc-500">No staff online right now.</div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {staff.slice(0, 8).map((s) => (
                <div
                  key={s.userId}
                  className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1"
                  title={s.name}
                >
                  {s.avatarUrl ? (
                    <img
                      src={s.avatarUrl}
                      alt={s.name}
                      className="h-5 w-5 rounded-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-white/10 grid place-items-center text-[10px] font-bold text-zinc-100">
                      {s.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="max-w-[130px] truncate text-[11px] text-zinc-200">{s.name}</div>
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-black/60" />
                </div>
              ))}
              {staff.length > 8 ? (
                <div className="text-[11px] text-zinc-400 self-center">+{staff.length - 8}</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2">
        {loading ? (
          <SidebarSkeleton />
        ) : filtered.length === 0 ? (
          <div className="px-2 py-3 text-xs text-zinc-400">No conversations</div>
        ) : (
          <div className="space-y-1">
            {filtered.map((c) => (
              <ConversationRow
                key={c.conversationId}
                conversation={c}
                selected={c.conversationId === selectedConversationId}
                onClick={() => onSelect(c.conversationId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

