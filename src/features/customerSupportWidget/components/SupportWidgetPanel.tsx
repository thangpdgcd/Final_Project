import React, { useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useSupportWidgetStore } from '../store/useSupportWidgetStore';
import { SupportWidgetHeader } from './SupportWidgetHeader';
import { SupportMessageList } from './SupportMessageList';
import { SupportComposer } from './SupportComposer';

type Props = {
  onClose: () => void;
  statusText: string;
  loadingMessages: boolean;
  onSend: (content: string) => Promise<void>;
};

export const SupportWidgetPanel: React.FC<Props> = ({ onClose, statusText, loadingMessages, onSend }) => {
  const { user } = useAuth();
  const myUserId = Number((user as any)?.user_ID ?? (user as any)?.userId ?? (user as any)?.id ?? 0) || 0;
  const messages = useSupportWidgetStore((s) => s.messages);
  const staffUserId = useSupportWidgetStore((s) => s.staffUserId);

  const supportName = useMemo(() => {
    const lastFromStaff = [...messages]
      .reverse()
      .find((m) => (m.sender?.userId ?? 0) !== myUserId && (m.sender?.name ?? '').trim());
    if (lastFromStaff?.sender?.name) return lastFromStaff.sender.name;
    if (staffUserId && staffUserId > 0) return `Staff #${staffUserId}`;
    return 'Support';
  }, [messages, myUserId, staffUserId]);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(max-width: 640px)')?.matches ?? false;
  }, []);

  return (
    <div
      className={[
        'fixed z-[60] pointer-events-none',
        isMobile ? 'left-0 right-0 bottom-0 px-2 pb-2' : 'bottom-4 right-4',
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-auto flex max-h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur shadow-[0_16px_50px_rgba(0,0,0,0.5)]',
          isMobile
            ? 'mx-auto h-[min(72vh,560px)] w-full max-w-[390px]'
            : 'h-[500px] w-[350px]',
        ].join(' ')}
        role="dialog"
        aria-label="Customer support chat"
      >
        <SupportWidgetHeader name={supportName} statusText={statusText} onClose={onClose} />
        <SupportMessageList myUserId={myUserId} messages={messages} loading={loadingMessages} />
        <SupportComposer disabled={myUserId <= 0} onSend={onSend} />
      </div>
    </div>
  );
};

