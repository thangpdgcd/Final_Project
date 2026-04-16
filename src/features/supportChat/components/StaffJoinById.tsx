import React, { useMemo, useState } from 'react';
import { Hash } from 'lucide-react';

type Props = {
  disabled?: boolean;
  onJoin: (conversationId: number) => void;
};

export const StaffJoinById: React.FC<Props> = ({ disabled, onJoin }) => {
  const [value, setValue] = useState('');

  const parsed = useMemo(() => {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  const canJoin = !disabled && parsed > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 border border-white/10 text-zinc-200">
          <Hash size={16} />
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          placeholder="Join by conversationId"
          className="h-8 w-full rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => canJoin && onJoin(parsed)}
          disabled={!canJoin}
          className="h-8 shrink-0 rounded-xl bg-white/10 border border-white/10 px-3 text-xs font-semibold text-zinc-100 hover:bg-white/15 disabled:opacity-50 disabled:hover:bg-white/10"
        >
          Join
        </button>
      </div>
    </div>
  );
};

