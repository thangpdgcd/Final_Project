import { useEffect } from 'react';
import { i18nKeys } from '@/constants/i18nKeys';
import { toastErrorWithFallback } from '@/lib/toast/i18nToast';
import { supportChatApi } from '../api/supportChat.api';
import { useSupportChatStore } from '../store/useSupportChatStore';

type Options = { enabled: boolean; conversationId: number | null };

export const useSupportChatMessages = ({ enabled, conversationId }: Options) => {
  const loaded = useSupportChatStore((s) =>
    conversationId ? s.loadedConversations[conversationId] : undefined,
  );
  const setConversationLoading = useSupportChatStore((s) => s.setConversationLoading);
  const setConversationMessages = useSupportChatStore((s) => s.setConversationMessages);
  const markConversationLoaded = useSupportChatStore((s) => s.markConversationLoaded);

  useEffect(() => {
    if (!enabled) return;
    if (!conversationId) return;
    if (loaded) return;

    let cancelled = false;
    setConversationLoading(conversationId, true);
    supportChatApi
      .getMessages(conversationId, { limit: 50, offset: 0 })
      .then((messages) => {
        if (cancelled) return;
        const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
        setConversationMessages(conversationId, sorted);
        markConversationLoaded(conversationId);
      })
      .catch((err) => {
        if (cancelled) return;
        toastErrorWithFallback(
          i18nKeys.toast.support.loadMessagesFailed,
          err?.message ? String(err.message) : undefined,
        );
      })
      .finally(() => {
        if (cancelled) return;
        setConversationLoading(conversationId, false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    conversationId,
    enabled,
    loaded,
    markConversationLoaded,
    setConversationLoading,
    setConversationMessages,
  ]);
};
