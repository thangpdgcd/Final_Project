import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';

type Props = {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string) => Promise<void> | void;
};

export const MessageComposer: React.FC<Props> = ({ disabled, sending, onSend }) => {
  const [value, setValue] = useState('');
  const canSend = useMemo(() => !disabled && !sending && value.trim().length > 0, [disabled, sending, value]);

  const doSend = async () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    await onSend(text);
  };

  return (
    <div className="p-3 border-t border-white/10 bg-black/40">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void doSend();
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? 'Connect to start chatting…' : 'Write a message…'}
          className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void doSend()}
          disabled={!canSend}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d6c59a] text-black hover:brightness-95 transition disabled:opacity-50 disabled:hover:brightness-100"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
      <div className="mt-1 text-[11px] text-zinc-500">Press Enter to send, Shift+Enter for newline.</div>
    </div>
  );
};

