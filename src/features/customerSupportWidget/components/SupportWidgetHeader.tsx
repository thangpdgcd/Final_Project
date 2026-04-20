import React from 'react';
import { ChevronDown, X } from 'lucide-react';

type Props = {
  name: string;
  statusText: string;
  onClose: () => void;
};

export const SupportWidgetHeader: React.FC<Props> = ({ name, statusText, onClose }) => {
  const initial = (name?.trim()?.[0] ?? 'S').toUpperCase();
  const isOnline = /online|active|connected/i.test(statusText);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 bg-zinc-900/90">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-9 w-9 rounded-full bg-zinc-700 border border-white/10 shrink-0 grid place-items-center font-bold text-sm text-white">
          {initial}
          <span
            className={[
              'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/60',
              isOnline ? 'bg-green-500' : 'bg-zinc-500',
            ].join(' ')}
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{name || 'Support'}</div>
          <div className="text-xs text-zinc-400 mt-0.5 truncate">{statusText}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10"
          aria-label="Collapse chat"
          title="Collapse"
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10"
          aria-label="Close chat"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
