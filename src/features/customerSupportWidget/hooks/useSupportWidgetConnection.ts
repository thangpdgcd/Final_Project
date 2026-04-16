import { useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ReceiveMessagePayload } from '../types';
import { useSupportWidgetStore } from '../store/useSupportWidgetStore';
import { connectSupportWidgetSocket, disconnectSupportWidgetSocket, supportWidgetEvents } from '../socket/supportWidget.socket';

type Options = {
  enabled: boolean;
};

export const useSupportWidgetConnection = ({ enabled }: Options) => {
  const mapSender = (raw: any): { userId: number; name: string; avatarUrl?: string } | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const userId = Number(raw.userId ?? raw.user_ID ?? raw.id ?? raw.senderUserId ?? raw.fromUserId ?? raw.sender_id ?? 0);
    if (!Number.isFinite(userId) || userId <= 0) return undefined;
    const name =
      typeof raw.name === 'string'
        ? raw.name
        : typeof raw.username === 'string'
          ? raw.username
          : typeof raw.fullName === 'string'
            ? raw.fullName
            : typeof raw.senderName === 'string'
              ? raw.senderName
              : typeof raw.staffName === 'string'
                ? raw.staffName
                : `User ${userId}`;
    const avatarUrl =
      typeof raw.avatarUrl === 'string'
        ? raw.avatarUrl
        : typeof raw.avatar === 'string'
          ? raw.avatar
          : undefined;
    return { userId, name, avatarUrl };
  };

  const mapSenderFromFlatFields = (raw: any): { userId: number; name: string; avatarUrl?: string } | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const userId = Number(
      raw.senderUserId ??
        raw.fromUserId ??
        raw.staffId ??
        raw.staffUserId ??
        raw.userId ??
        raw.user_ID ??
        raw.sender_id ??
        raw.id ??
        0,
    );
    if (!Number.isFinite(userId) || userId <= 0) return undefined;
    const name =
      typeof raw.senderName === 'string'
        ? raw.senderName
        : typeof raw.staffName === 'string'
          ? raw.staffName
          : typeof raw.fromUserName === 'string'
            ? raw.fromUserName
            : typeof raw.userName === 'string'
              ? raw.userName
              : typeof raw.username === 'string'
                ? raw.username
                : typeof raw.fullName === 'string'
                  ? raw.fullName
                  : `User ${userId}`;
    const avatarUrl = typeof raw.avatarUrl === 'string' ? raw.avatarUrl : typeof raw.avatar === 'string' ? raw.avatar : undefined;
    return { userId, name, avatarUrl };
  };

  const normalizeReceive = (raw: any): ReceiveMessagePayload | null => {
    if (!raw || typeof raw !== 'object') return null;
    const message = (raw as any).message && typeof (raw as any).message === 'object' ? (raw as any).message : undefined;
    const conversationId = Number(
      (raw as any).conversationId ??
        (raw as any).conversation_ID ??
        (raw as any).conversation ??
        (raw as any).roomId ??
        (raw as any).room_id ??
        (message as any)?.conversationId ??
        (message as any)?.conversation_ID ??
        (message as any)?.conversation ??
        (message as any)?.roomId ??
        (message as any)?.room_id,
    );
    if (!Number.isFinite(conversationId) || conversationId <= 0) return null;

    // Some backends emit the saved message at top-level (no `message` field).
    const topLevelLooksLikeMessage = (raw as any).type && ((raw as any).content || (raw as any).action || (raw as any).meta);
    const candidate = message ?? (topLevelLooksLikeMessage ? raw : undefined);
    if (!candidate) return null;

    const senderRaw =
      (candidate as any).sender ??
      (candidate as any).fromUser ??
      (candidate as any).user ??
      (raw as any).sender ??
      (raw as any).fromUser ??
      (raw as any).user ??
      (raw as any).staff ??
      undefined;

    const createdAt =
      typeof (candidate as any).createdAt === 'number'
        ? (candidate as any).createdAt
        : (candidate as any).createdAt
          ? Date.parse(String((candidate as any).createdAt)) || Date.now()
          : Date.now();

    const normalizedMessage: any = {
      ...candidate,
      conversationId,
      id: (candidate as any).id ?? (candidate as any).messageId ?? `${conversationId}-${createdAt}`,
      createdAt,
      type: (candidate as any).type === 'action' ? 'action' : 'text',
      sender: mapSender(senderRaw) ?? mapSenderFromFlatFields(candidate) ?? mapSenderFromFlatFields(raw),
    };

    if (normalizedMessage.type === 'text') {
      normalizedMessage.content = String((candidate as any).content ?? (candidate as any).text ?? (candidate as any).message ?? '');
      if (!normalizedMessage.content.trim()) {
        // Ignore empty text payloads (typing/presence/noise events).
        return null;
      }
    }

    return { conversationId, message: normalizedMessage } as ReceiveMessagePayload;
  };

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSupportWidgetSocket();
    useSupportWidgetStore.getState().setConnectionStatus(socket.connected ? 'connected' : 'connecting');

    const onConnect = () => useSupportWidgetStore.getState().setConnectionStatus('connected');
    const onDisconnect = () => useSupportWidgetStore.getState().setConnectionStatus('disconnected');
    const onError = () => useSupportWidgetStore.getState().setConnectionStatus('error');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    const offJoined = supportWidgetEvents.onJoinedRoom((raw: any) => {
      const cid =
        Number(
          raw?.conversationId ??
            raw?.roomId ??
            raw?.data?.conversationId ??
            raw?.data?.roomId ??
            raw?.conversation?.conversationId ??
            raw?.conversation?.roomId ??
            raw?.id ??
            0,
        ) || 0;
      if (cid > 0) {
        const s = useSupportWidgetStore.getState();
        s.setConversationId(cid);
        s.setJoinedConversationId(cid);
        s.setJoiningConversationId(null);
      }
    });

    const offReceive = supportWidgetEvents.onReceiveMessage((raw: any) => {
      const payload = normalizeReceive(raw);
      if (!payload) return;
      const s = useSupportWidgetStore.getState();
      s.setConversationId(payload.conversationId);
      s.setJoinedConversationId(payload.conversationId);
      s.setJoiningConversationId(null);
      if (payload.message) {
        s.reconcileOptimisticIfMatch(payload.message);
      }
      s.appendIncoming(payload);
    });

    const offError = supportWidgetEvents.onError((payload: any) => {
      const msg =
        typeof payload?.message === 'string'
          ? payload.message
          : typeof payload === 'string'
            ? payload
            : 'Chat error';
      toast.error(msg);
    });

    return () => {
      offJoined();
      offReceive();
      offError();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) return;
    disconnectSupportWidgetSocket();
    useSupportWidgetStore.getState().setConnectionStatus('disconnected');
  }, [enabled]);
};

