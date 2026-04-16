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
  const lastKnownConversation = useSupportWidgetStore((s) => s.lastKnownConversation);

  const isGenericStaffName = (name: string) => /^(user|staff)\s*#?\s*\d+$/i.test(name.trim());

  const supportName = useMemo(() => {
    const staffMessages = [...messages]
      .reverse()
      .filter((m) => (m.sender?.userId ?? 0) !== myUserId);

    const namedStaff = staffMessages.find((m) => {
      const n = (m.sender?.name ?? '').trim();
      return !!n && !isGenericStaffName(n);
    });
    if (namedStaff?.sender?.name) return namedStaff.sender.name.trim();

    const staffParticipant = (lastKnownConversation?.participants ?? []).find((p) => {
      const role = String(p.roleAtJoin ?? '').toLowerCase();
      return role === 'staff' || role === 'admin' || role === 'support';
    });
    const participantName = String(staffParticipant?.name ?? '').trim();
    if (participantName) return participantName;

    const conversationTitle = String(lastKnownConversation?.title ?? '').trim();
    if (conversationTitle && !/^(support|conversation\s*\d+)$/i.test(conversationTitle)) {
      return conversationTitle;
    }

    const anyStaffName = staffMessages
      .map((m) => (m.sender?.name ?? '').trim())
      .find((n) => !!n);
    if (anyStaffName) return anyStaffName;

    return 'Support';
  }, [lastKnownConversation?.participants, lastKnownConversation?.title, messages, myUserId]);

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

