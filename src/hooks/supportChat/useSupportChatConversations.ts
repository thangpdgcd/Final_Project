import { useEffect } from 'react';
import { i18nKeys } from '@/translates/constants/i18nKeys';
import { toastErrorWithFallback } from '@/utils/lib/toast/i18nToast';
import { supportChatApi } from '@/features/supportChat/api/supportChat.api';
import { useSupportChatStore } from '@/features/supportChat/store/useSupportChatStore';

type Options = { enabled: boolean };

export const useSupportChatConversations = ({ enabled }: Options) => {
  const conversations = useSupportChatStore((s) => s.conversations);
  const loading = useSupportChatStore((s) => s.loadingConversations);
  const setLoading = useSupportChatStore((s) => s.setLoadingConversations);
  const setConversations = useSupportChatStore((s) => s.setConversations);

  useEffect(() => {
    if (!enabled) return;
    if (loading) return;
    if (conversations.length > 0) return;

    let cancelled = false;
    setLoading(true);
    supportChatApi
      .getConversations()
      .then((list) => {
        if (cancelled) return;
        setConversations(list);
      })
      .catch((err) => {
        if (cancelled) return;
        toastErrorWithFallback(
          i18nKeys.toast.support.loadConversationsFailed,
          err?.message ? String(err.message) : undefined,
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversations.length, enabled, loading, setConversations, setLoading]);
};

