import React, { useMemo, useState } from 'react';
import { Button, Input } from 'antd';
import { Send } from 'lucide-react';

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export const MessageInput: React.FC<Props> = ({ disabled, onSend }) => {
  const [value, setValue] = useState('');
  const canSend = useMemo(() => !disabled && value.trim().length > 0, [disabled, value]);

  return (
    <div className="p-3 border-t border-white/10">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!canSend) return;
              const text = value.trim();
              setValue('');
              onSend(text);
            }
          }}
          disabled={disabled}
        />
        <Button
          type="primary"
          disabled={!canSend}
          onClick={() => {
            if (!canSend) return;
            const text = value.trim();
            setValue('');
            onSend(text);
          }}
          icon={<Send size={16} />}
        >
          Send
        </Button>
      </div>
      <div className="mt-2 text-[11px] text-zinc-500">Enter to send, Shift+Enter for newline.</div>
    </div>
  );
};
