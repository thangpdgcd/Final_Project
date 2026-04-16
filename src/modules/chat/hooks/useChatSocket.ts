import { useEffect, useRef } from 'react';
import type { ChatMessage, ChatUserRef } from '../types';
import { chatEvents } from '../socket/chatEvents';
import { connectSocket, disconnectSocket } from '../socket/socketClient';
import { useChatStore } from '../store/useChatStore';

const createId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

type Options = {
  enabled: boolean;
  myRef: ChatUserRef | null;
};

export const useChatSocket = ({ enabled, myRef }: Options) => {
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);
  const joinedRooms = useChatStore((s) => s.joinedRooms);
  const markJoined = useChatStore((s) => s.markJoined);

  const handledActionCorrelation = useRef<Record<string, true>>({});

  useEffect(() => {
    if (!enabled) return;
    if (!myRef) return;

    const socket = connectSocket();
    useChatStore.getState().setConnectionStatus('connecting');

    const onConnect = () => useChatStore.getState().setConnectionStatus('connected');
    const onDisconnect = () => useChatStore.getState().setConnectionStatus('disconnected');
    const onError = () => useChatStore.getState().setConnectionStatus('error');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    const offReceive = chatEvents.onReceiveMessage((payload) => {
      useChatStore.getState().appendMessage(payload, { incrementUnreadIfNotSelected: true });
    });

    const onActionResult = (payload: any) => {
      const correlationId = typeof payload?.correlationId === 'string' ? payload.correlationId : '';
      if (correlationId) {
        if (handledActionCorrelation.current[correlationId]) return;
        handledActionCorrelation.current[correlationId] = true;
      }

      const roomId = String(payload?.roomId ?? '');
      if (!roomId) return;

      const ok = payload?.ok === true;
      const error = payload?.error ? String(payload.error) : '';

      const text = ok ? 'Action completed.' : `Action failed: ${error || 'Unknown error'}`;
      const sysMessage: ChatMessage = {
        id: createId(),
        roomId,
        type: 'text',
        text,
        sender: { id: 'system', name: 'System', role: 'admin' },
        createdAt: Date.now(),
      };
      useChatStore.getState().appendMessage({ roomId, message: sysMessage }, { incrementUnreadIfNotSelected: true });
    };

    socket.on('action_event', onActionResult);
    socket.on('action_event_result', onActionResult);

    return () => {
      offReceive();
      socket.off('action_event', onActionResult);
      socket.off('action_event_result', onActionResult);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [enabled, myRef]);

  useEffect(() => {
    if (!enabled) return;
    if (!myRef) return;
    if (!selectedRoomId) return;
    if (joinedRooms[selectedRoomId]) return;

    chatEvents.joinRoom({ roomId: selectedRoomId, user: myRef });
    markJoined(selectedRoomId);
  }, [enabled, joinedRooms, markJoined, myRef, selectedRoomId]);

  useEffect(() => {
    if (enabled) return;
    disconnectSocket();
    useChatStore.getState().setConnectionStatus('disconnected');
  }, [enabled]);
};

