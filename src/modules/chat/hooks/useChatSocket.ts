import { useEffect, useRef } from 'react';
import type { ChatMessage, ChatUserRef, ReceiveMessagePayload } from '../types';
import { chatEvents } from '../socket/chatEvents';
import { connectSocket, disconnectSocket } from '../socket/socketClient';
import { useChatStore } from '../store/useChatStore';
import { useVoucherVaultStore } from '@/features/voucher/store/useVoucherVaultStore';

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

/** Server `emitToParticipants` sends DB rows; map to UI `ChatMessage`. */
const toReceivePayload = (payload: unknown, myUserId: string): ReceiveMessagePayload | null => {
  const p = payload as Record<string, unknown>;
  const rawMsg = p?.message as Record<string, unknown> | undefined;
  if (
    rawMsg &&
    typeof rawMsg === 'object' &&
    rawMsg.sender &&
    typeof (rawMsg as { text?: unknown }).text === 'string'
  ) {
    return payload as ReceiveMessagePayload;
  }

  const roomId = String(p?.roomId ?? p?.conversationId ?? '');
  if (!roomId || !rawMsg || typeof rawMsg !== 'object') return null;

  const plain = (rawMsg as { dataValues?: Record<string, unknown> }).dataValues ?? rawMsg;
  const senderUserId = String(plain.senderUserId ?? plain.sender_user_id ?? '');
  const text = String(plain.text ?? plain.content ?? '');
  const id = String(plain.id ?? createId());
  const createdAt =
    plain.createdAt != null
      ? typeof plain.createdAt === 'number'
        ? plain.createdAt
        : Date.parse(String(plain.createdAt)) || Date.now()
      : Date.now();
  const isMine = senderUserId === String(myUserId);

  const message: ChatMessage = {
    id,
    roomId,
    type: 'text',
    text,
    createdAt,
    sender: {
      id: senderUserId || 'unknown',
      name: isMine ? 'You' : 'Support',
      role: isMine ? 'user' : 'staff',
    },
  };

  return { roomId, message };
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

    // Hydrate voucher vault once when socket is enabled (best-effort).
    useVoucherVaultStore.getState().hydrate();

    const onConnect = () => useChatStore.getState().setConnectionStatus('connected');
    const onDisconnect = () => useChatStore.getState().setConnectionStatus('disconnected');
    const onError = () => useChatStore.getState().setConnectionStatus('error');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    const offReceive = chatEvents.onReceiveMessage((payload) => {
      const normalized = toReceivePayload(payload, myRef.id);
      if (!normalized) return;
      useChatStore.getState().appendMessage(normalized, { incrementUnreadIfNotSelected: true });
    });

    const onVoucher = (payload: any) => {
      const code = typeof payload?.code === 'string' ? payload.code.trim() : '';
      const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
      if (!code) return;
      useVoucherVaultStore.getState().add({ code, message: message || undefined });
    };

    socket.on('send_voucher', onVoucher);

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
      socket.off('send_voucher', onVoucher);
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

