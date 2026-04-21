import { useEffect } from 'react';
import { chatApi } from '@/features/chat/services/chat.api';
import { useChatStore } from '@/features/chat/store/useChatStore';

type Options = {
  enabled: boolean;
};

export const useConversations = ({ enabled }: Options) => {
  const conversations = useChatStore((s) => s.conversations);
  const loadingConversations = useChatStore((s) => s.loadingConversations);
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);
  const setLoadingConversations = useChatStore((s) => s.setLoadingConversations);
  const setConversations = useChatStore((s) => s.setConversations);

  useEffect(() => {
    if (!enabled) return;
    if (loadingConversations) return;
    if (conversations.length > 0) return;

    let cancelled = false;
    setLoadingConversations(true);

    chatApi
      .getConversations()
      .then((list) => {
        if (cancelled) return;
        setConversations(list);
      })
      .catch(() => {
        // keep existing state on failure
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingConversations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    conversations.length,
    enabled,
    loadingConversations,
    selectedRoomId,
    setConversations,
    setLoadingConversations,
  ]);
};

