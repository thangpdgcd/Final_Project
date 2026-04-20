import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Props = {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string) => Promise<void> | void;
};

export const SupportComposer: React.FC<Props> = ({ disabled, sending, onSend }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = useMemo(
    () => !disabled && !sending && value.trim().length > 0,
    [disabled, sending, value],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }, [value]);

  const doSend = async () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    await onSend(text);
  };

  return (
    <div className="border-t border-white/10 bg-zinc-900/95 p-2.5">
      <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-2 focus-within:border-white/20">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
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
            placeholder={disabled ? 'Connect to start chatting...' : 'Aa'}
            className="min-h-[24px] max-h-28 w-full resize-none bg-transparent px-2 py-1 text-[15px] text-zinc-100 placeholder:text-zinc-400 outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void doSend()}
            disabled={!canSend}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            aria-label="Send message"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      <div className="mt-2 px-1 text-[11px] text-zinc-500">
        Enter to send - Shift + Enter for new line
      </div>
    </div>
  );
};
