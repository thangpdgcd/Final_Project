import React, { useMemo, useState } from 'react';
import { Plus, Send, Smile } from 'lucide-react';

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
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 disabled:opacity-50"
          aria-label="More options"
          title="More"
        >
          <Plus size={18} />
        </button>

        <div className="flex-1 rounded-full bg-white/5 border border-white/10 px-3 py-2 focus-within:border-white/20">
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
              placeholder={disabled ? 'Connect to start chatting…' : 'Aa'}
              className="min-h-[24px] max-h-28 w-full flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none disabled:opacity-60"
            />

            <button
              type="button"
              disabled={disabled}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-200 hover:bg-white/10 disabled:opacity-50"
              aria-label="Emoji"
              title="Emoji"
            >
              <Smile size={18} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void doSend()}
          disabled={!canSend}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0866ff] text-white hover:brightness-110 transition disabled:opacity-50 disabled:hover:brightness-100"
          aria-label="Send message"
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

