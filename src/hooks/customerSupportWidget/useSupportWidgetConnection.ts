import { useEffect } from 'react';
import { i18nKeys } from '@/translates/constants/i18nKeys';
import { toastErrorWithFallback } from '@/utils/lib/toast/i18nToast';
import type { ReceiveMessagePayload } from '@/features/customerSupportWidget/types';
import { useSupportWidgetStore } from '@/features/customerSupportWidget/store/useSupportWidgetStore';
import { useVoucherVaultStore } from '@/features/voucher/store/useVoucherVaultStore';
import {
  connectSupportWidgetSocket,
  disconnectSupportWidgetSocket,
  supportWidgetEvents,
} from '@/features/customerSupportWidget/socket/supportWidget.socket';

type Options = {
  enabled: boolean;
};

export const useSupportWidgetConnection = ({ enabled }: Options) => {
  const pickString = (...values: unknown[]): string | undefined => {
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    return undefined;
  };

  const pickNumber = (...values: unknown[]): number => {
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  };

  const mapAvatar = (raw: any): string | undefined =>
    pickString(
      raw?.avatarUrl,
      raw?.avatar_url,
      raw?.avatar,
      raw?.photoUrl,
      raw?.photo_url,
      raw?.imageUrl,
      raw?.image_url,
      raw?.image,
      raw?.profile?.avatarUrl,
      raw?.profile?.avatar,
      raw?.user?.avatarUrl,
      raw?.user?.avatar,
      raw?.staff?.avatarUrl,
      raw?.staff?.avatar,
    );

  const mapName = (raw: any): string | undefined =>
    pickString(
      raw?.name,
      raw?.displayName,
      raw?.display_name,
      raw?.fullName,
      raw?.full_name,
      raw?.username,
      raw?.userName,
      raw?.user_name,
      raw?.senderName,
      raw?.sender_name,
      raw?.fromUserName,
      raw?.from_user_name,
      raw?.staffName,
      raw?.staff_name,
      raw?.profile?.name,
      raw?.profile?.displayName,
      raw?.user?.name,
      raw?.user?.displayName,
      raw?.user?.username,
      raw?.staff?.name,
      raw?.staff?.displayName,
      raw?.staff?.username,
    );

  const mapSender = (
    raw: any,
  ): { userId: number; name: string; avatarUrl?: string } | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const userId = pickNumber(
      raw.userId,
      raw.user_ID,
      raw.id,
      raw.senderUserId,
      raw.fromUserId,
      raw.staffId,
      raw.staffUserId,
      raw.sender_id,
      raw.user?.userId,
      raw.user?.user_ID,
      raw.user?.id,
      raw.staff?.userId,
      raw.staff?.user_ID,
      raw.staff?.id,
      raw.profile?.userId,
      raw.profile?.id,
    );
    if (!userId) return undefined;
    const name = mapName(raw) ?? `User ${userId}`;
    const avatarUrl = mapAvatar(raw);
    return { userId, name, avatarUrl };
  };

  const mapSenderFromFlatFields = (
    raw: any,
  ): { userId: number; name: string; avatarUrl?: string } | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const userId = pickNumber(
      raw.senderUserId ??
        raw.fromUserId ??
        raw.staffId ??
        raw.staffUserId ??
        raw.userId ??
        raw.user_ID ??
        raw.sender_id ??
        raw.id ??
        raw.sender?.userId ??
        raw.sender?.user_ID ??
        raw.sender?.id ??
        raw.fromUser?.userId ??
        raw.fromUser?.user_ID ??
        raw.fromUser?.id ??
        raw.user?.userId ??
        raw.user?.user_ID ??
        raw.user?.id,
    );
    if (!userId) return undefined;
    const name = mapName(raw) ?? `User ${userId}`;
    const avatarUrl = mapAvatar(raw);
    return { userId, name, avatarUrl };
  };

  const normalizeReceive = (raw: any): ReceiveMessagePayload | null => {
    if (!raw || typeof raw !== 'object') return null;
    const message =
      (raw as any).message && typeof (raw as any).message === 'object'
        ? (raw as any).message
        : undefined;
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
    const topLevelLooksLikeMessage =
      (raw as any).type && ((raw as any).content || (raw as any).action || (raw as any).meta);
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
      sender:
        mapSender(senderRaw) ?? mapSenderFromFlatFields(candidate) ?? mapSenderFromFlatFields(raw),
    };

    if (normalizedMessage.type === 'text') {
      normalizedMessage.content = String(
        (candidate as any).content ?? (candidate as any).text ?? (candidate as any).message ?? '',
      );
      if (!normalizedMessage.content.trim()) {
        // Ignore empty text payloads (typing/presence/noise events).
        return null;
      }
    }

    return { conversationId, message: normalizedMessage } as ReceiveMessagePayload;
  };

  const extractVoucherCode = (text: string): string | null => {
    const raw = String(text ?? '').trim();
    if (!raw) return null;

    // Common staff message formats:
    // - "Mã voucher: ABC123"
    // - "Voucher code: ABC123"
    // - "GIFT VOUCHER ABC123"
    const match =
      raw.match(/(?:mã\s*voucher|voucher\s*code|gift\s*voucher)\s*[:\-]?\s*([A-Z0-9_-]{4,})/i) ??
      raw.match(/\b([A-Z0-9]{6,})\b/); // fallback (last resort)

    const code = String(match?.[1] ?? '').trim().toUpperCase();
    if (!code) return null;
    // avoid capturing generic words
    if (code === 'VOUCHER' || code === 'CODE') return null;
    return code;
  };

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSupportWidgetSocket();
    useSupportWidgetStore
      .getState()
      .setConnectionStatus(socket.connected ? 'connected' : 'connecting');

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

      // Auto-save voucher codes sent by staff into the local voucher vault
      // so they show up immediately in Voucher Vault / Promotions.
      try {
        if (payload.message?.type === 'text') {
          const content = String((payload.message as any).content ?? '');
          const code = extractVoucherCode(content);
          if (code) {
            useVoucherVaultStore.getState().add({ code, message: content });
          }
        }
      } catch {
        // ignore
      }
    });

    // Some backends emit a dedicated voucher event to customers.
    const onVoucher = (payload: any) => {
      const code = typeof payload?.code === 'string' ? payload.code.trim() : '';
      const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
      if (!code) return;
      useVoucherVaultStore.getState().add({ code, message: message || undefined });
    };
    socket.on('send_voucher', onVoucher);

    const offError = supportWidgetEvents.onError((payload: any) => {
      const msg =
        typeof payload?.message === 'string'
          ? payload.message
          : typeof payload === 'string'
            ? payload
            : 'Chat error';
      toastErrorWithFallback(i18nKeys.toast.support.chatError, msg);
    });

    return () => {
      offJoined();
      offReceive();
      offError();
      socket.off('send_voucher', onVoucher);
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

