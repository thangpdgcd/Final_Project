import { useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ReceiveMessagePayload } from '../types';
import { useSupportChatStore } from '../store/useSupportChatStore';
import {
  connectSupportChatSocket,
  disconnectSupportChatSocket,
  supportChatEvents,
} from '../socket/supportChat.socket';

type Options = {
  enabled: boolean;
};

export const useSupportChatConnection = ({ enabled }: Options) => {
  const selectedConversationId = useSupportChatStore((s) => s.selectedConversationId);
  const joined = useSupportChatStore((s) => s.joinedConversations);
  const appendIncoming = useSupportChatStore((s) => s.appendIncoming);
  const reconcileOptimisticIfMatch = useSupportChatStore((s) => s.reconcileOptimisticIfMatch);
  const migrateConversation = useSupportChatStore((s) => s.migrateConversation);
  const markConversationJoined = useSupportChatStore((s) => s.markConversationJoined);
  const setConnectionStatus = useSupportChatStore((s) => s.setConnectionStatus);

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSupportChatSocket();
    setConnectionStatus('connecting');

    const onConnect = () => setConnectionStatus('connected');
    const onDisconnect = () => setConnectionStatus('disconnected');
    const onError = () => setConnectionStatus('error');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    const offReceive = supportChatEvents.onReceiveMessage((payload: ReceiveMessagePayload) => {
      const state = useSupportChatStore.getState();
      const draftId = -1;
      if (
        state.selectedConversationId === draftId &&
        payload.conversationId !== draftId &&
        (state.messagesByConversationId[draftId]?.length ?? 0) > 0
      ) {
        migrateConversation(draftId, payload.conversationId);
      }

      reconcileOptimisticIfMatch(payload.message);
      appendIncoming(payload, { incrementUnreadIfNotSelected: true });
    });

    const offError = supportChatEvents.onError((payload: any) => {
      const msg =
        typeof payload?.message === 'string'
          ? payload.message
          : typeof payload === 'string'
            ? payload
            : 'Chat error';
      toast.error(msg);
    });

    return () => {
      offReceive();
      offError();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [appendIncoming, enabled, migrateConversation, reconcileOptimisticIfMatch, setConnectionStatus]);

  useEffect(() => {
    if (!enabled) return;
    if (!selectedConversationId) return;
    if (selectedConversationId <= 0) return;
    if (joined[selectedConversationId]) return;

    supportChatEvents.joinRoom({ conversationId: selectedConversationId });
    markConversationJoined(selectedConversationId);
  }, [enabled, joined, markConversationJoined, selectedConversationId]);

  useEffect(() => {
    if (enabled) return;
    disconnectSupportChatSocket();
    setConnectionStatus('disconnected');
  }, [enabled, setConnectionStatus]);
};

