import { useEffect } from 'react';
import { chatApi } from '@/features/chat/services/chat.api';
import { useChatStore } from '@/features/chat/store/useChatStore';

type Options = {
  enabled: boolean;
};

export const useRoomMessages = ({ enabled }: Options) => {
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);
  const loadedRooms = useChatStore((s) => s.loadedRooms);
  const loadingMessagesByRoomId = useChatStore((s) => s.loadingMessagesByRoomId);
  const setRoomLoading = useChatStore((s) => s.setRoomLoading);
  const setRoomMessages = useChatStore((s) => s.setRoomMessages);
  const markRoomLoaded = useChatStore((s) => s.markRoomLoaded);

  useEffect(() => {
    if (!enabled) return;
    if (!selectedRoomId) return;
    if (loadedRooms[selectedRoomId]) return;
    if (loadingMessagesByRoomId[selectedRoomId]) return;

    let cancelled = false;
    setRoomLoading(selectedRoomId, true);

    chatApi
      .getMessages(selectedRoomId)
      .then((messages) => {
        if (cancelled) return;
        setRoomMessages(selectedRoomId, messages);
        markRoomLoaded(selectedRoomId);
      })
      .catch(() => {
        // keep existing state on failure
      })
      .finally(() => {
        if (cancelled) return;
        setRoomLoading(selectedRoomId, false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    loadedRooms,
    loadingMessagesByRoomId,
    markRoomLoaded,
    selectedRoomId,
    setRoomLoading,
    setRoomMessages,
  ]);
};

