import React, { useEffect, useMemo, useRef } from 'react';
import { i18nKeys } from '@/constants/i18nKeys';
import { toastError, toastErrorWithFallback } from '@/lib/toast/i18nToast';
import { useAuth } from '@/store/AuthContext';
import { supportWidgetApi } from '../api/supportWidget.api';
import { supportWidgetEvents } from '../socket/supportWidget.socket';
import { useSupportWidgetStore } from '../store/useSupportWidgetStore';
import { useSupportWidgetConnection } from '../hooks/useSupportWidgetConnection';
import { useSupportWidgetMessages } from '../hooks/useSupportWidgetMessages';
import { SupportWidgetButton } from './SupportWidgetButton';
import { SupportWidgetPanel } from './SupportWidgetPanel';

const FALLBACK_DRAFT_ID = -1;

export const CustomerSupportWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const myUserId = Number((user as any)?.user_ID ?? (user as any)?.userId ?? (user as any)?.id ?? 0) || 0;
  const enabled = Boolean(isAuthenticated && myUserId);
  const hasHydrated = useSupportWidgetStore((s) => s.hasHydrated);

  const isOpen = useSupportWidgetStore((s) => s.isOpen);
  const unreadCount = useSupportWidgetStore((s) => s.unreadCount);
  const connectionStatus = useSupportWidgetStore((s) => s.connectionStatus);
  const conversationId = useSupportWidgetStore((s) => s.conversationId);
  const joinedConversationId = useSupportWidgetStore((s) => s.joinedConversationId);
  const joiningConversationId = useSupportWidgetStore((s) => s.joiningConversationId);
  const hasAutoAssigned = useSupportWidgetStore((s) => s.hasAutoAssigned);
  const loadingMessages = useSupportWidgetStore((s) => s.loadingMessages);
  const messages = useSupportWidgetStore((s) => s.messages);
  const staffUserId = useSupportWidgetStore((s) => s.staffUserId);

  const setOpen = useSupportWidgetStore((s) => s.setOpen);
  const clearUnread = useSupportWidgetStore((s) => s.clearUnread);
  const setConversationId = useSupportWidgetStore((s) => s.setConversationId);
  const setJoinedConversationId = useSupportWidgetStore((s) => s.setJoinedConversationId);
  const setJoiningConversationId = useSupportWidgetStore((s) => s.setJoiningConversationId);
  const setHasAutoAssigned = useSupportWidgetStore((s) => s.setHasAutoAssigned);
  const setLastKnownConversation = useSupportWidgetStore((s) => s.setLastKnownConversation);
  const setStaffUserId = useSupportWidgetStore((s) => s.setStaffUserId);
  const setMessages = useSupportWidgetStore((s) => s.setMessages);
  const setLoadedConversationId = useSupportWidgetStore((s) => s.setLoadedConversationId);

  const appendOptimisticText = useSupportWidgetStore((s) => s.appendOptimisticText);
  const markOptimisticSent = useSupportWidgetStore((s) => s.markOptimisticSent);
  const markOptimisticFailed = useSupportWidgetStore((s) => s.markOptimisticFailed);
  const reconcileOptimisticIfMatch = useSupportWidgetStore((s) => s.reconcileOptimisticIfMatch);
  const appendIncoming = useSupportWidgetStore((s) => s.appendIncoming);
  const previousUserIdRef = useRef<number>(0);

  // Socket should connect as soon as auth is available so backend can see online customer.
  useSupportWidgetConnection({ enabled });
  // Keep REST history loading behind hydration to avoid overwriting hydrated message cache.
  useSupportWidgetMessages({ enabled: enabled && hasHydrated && isOpen, conversationId });

  const connected = connectionStatus === 'connected';
  const fetchedConversationsRef = useRef(false);

  const statusText = useMemo(() => {
    if (!enabled) return 'Login required';
    if (connectionStatus === 'connected') {
      if (staffUserId && staffUserId > 0) return 'Support agent online';
      return 'Waiting for support agent';
    }
    if (connectionStatus === 'connecting' || connectionStatus === 'idle') return 'Connecting…';
    if (connectionStatus === 'error') return 'Connection error';
    return 'Offline';
  }, [connectionStatus, enabled, staffUserId]);

  useEffect(() => {
    // Prevent using stale persisted conversation from another account.
    if (!enabled) {
      previousUserIdRef.current = 0;
      return;
    }
    if (previousUserIdRef.current === 0) {
      previousUserIdRef.current = myUserId;
      return;
    }
    if (previousUserIdRef.current === myUserId) return;

    previousUserIdRef.current = myUserId;
    setConversationId(null);
    setJoinedConversationId(null);
    setJoiningConversationId(null);
    setHasAutoAssigned(false);
    setLastKnownConversation(null);
    setStaffUserId(null);
    setLoadedConversationId(null);
    setMessages([]);
  }, [
    enabled,
    myUserId,
    setConversationId,
    setHasAutoAssigned,
    setJoinedConversationId,
    setJoiningConversationId,
    setLastKnownConversation,
    setLoadedConversationId,
    setMessages,
    setStaffUserId,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    clearUnread();
  }, [clearUnread, isOpen]);

  useEffect(() => {
    if (!enabled) return;
    if (!connected) return;
    if (!conversationId || conversationId <= 0) return;

    if (joinedConversationId === conversationId) return;
    if (joiningConversationId === conversationId) return;

    // Ensure the customer is joined to the correct conversation room once.
    // We join even when the widget is closed so incoming messages can be received
    // and reflected as unread count.
    supportWidgetEvents.joinRoom({ conversationId });
    setJoiningConversationId(conversationId);
  }, [
    connected,
    conversationId,
    enabled,
    joinedConversationId,
    joiningConversationId,
    setJoiningConversationId,
  ]);

  useEffect(() => { 
    if (!enabled) return;
    if (!isOpen) return;
    if (fetchedConversationsRef.current) return;
    fetchedConversationsRef.current = true;

    // Fetch conversations once on open to reuse an existing thread if present.
    let cancelled = false;
    supportWidgetApi
      .getConversations({ userId: myUserId, mineOnly: true, limit: 20, offset: 0 })
      .then((list) => {
        if (cancelled) return;
        const owned = list.filter((c) => {
          if (!Array.isArray(c.participants) || c.participants.length === 0) return false;
          return c.participants.some((p) => Number(p.userId) === myUserId);
        });
        const sorted = [...owned].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
        const latest = sorted[0] ?? null;
        setLastKnownConversation(latest);
        const staff = latest?.participants?.find((p) => {
          const role = String(p.roleAtJoin ?? '').toLowerCase();
          return role === 'staff' || role === 'admin' || role === 'support';
        });
        if (staff?.userId) setStaffUserId(staff.userId);
        if (latest?.conversationId && !conversationId) {
          setConversationId(latest.conversationId);
          // joining handled by the join effect above
        }
      })
      .catch(() => {
        // silent: widget can still auto-assign on first message
      });

    return () => {
      cancelled = true;
    };
    // intentionally not depending on conversationId to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isOpen, myUserId, setConversationId, setLastKnownConversation, setStaffUserId]);

  useEffect(() => {
    if (!enabled) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    // Keep staffUserId in sync from actual thread messages.
    const latestFromStaff = [...messages]
      .reverse()
      .find((m) => (m.sender?.userId ?? 0) > 0 && (m.sender?.userId ?? 0) !== myUserId);
    const nextStaffUserId = Number(latestFromStaff?.sender?.userId ?? 0) || null;
    if (nextStaffUserId) {
      setStaffUserId(nextStaffUserId);
    }
  }, [enabled, messages, myUserId, setStaffUserId]);

  useEffect(() => {
    if (!enabled) return;
    if (!isOpen) return;
    if (!connected) return;
    if (conversationId) return;
    if (hasAutoAssigned) return;

    // First open with no conversation: trigger auto-assign + join once per session.
    setHasAutoAssigned(true);
    // Wait for `joined_room` / `chat:join` to get the assigned conversationId.
    supportWidgetEvents.joinRoom({});
    setJoiningConversationId(FALLBACK_DRAFT_ID);
    setConversationId(FALLBACK_DRAFT_ID);
  }, [connected, conversationId, enabled, hasAutoAssigned, isOpen, setConversationId, setHasAutoAssigned, setJoiningConversationId]);

  const onSend = async (content: string) => {
    if (!enabled) {
      toastError(i18nKeys.toast.support.loginToChat);
      return;
    }

    const cid = conversationId ?? FALLBACK_DRAFT_ID;
    const { clientId } = appendOptimisticText(cid, myUserId, content);
    // Safety net: some backends accept the message but do not echo a resolvable ack.
    window.setTimeout(() => {
      markOptimisticSent(clientId);
    }, 3000);

    try {
      const isNotParticipantError = (payload: any) => {
        const text =
          typeof payload?.message === 'string'
            ? payload.message
            : typeof payload?.error === 'string'
              ? payload.error
              : '';
        return /not a participant/i.test(text);
      };

      const resetConversationContext = () => {
        setConversationId(null);
        setJoinedConversationId(null);
        setJoiningConversationId(null);
      };

      const sendWithAck = async (payload: any): Promise<any> => {
        return await new Promise((resolve) => {
          let settled = false;
          const done = (res: any) => {
            if (settled) return;
            settled = true;
            resolve(res);
          };
          supportWidgetEvents.sendMessage(payload, (ack: any) => done(ack));
          window.setTimeout(() => done(undefined), 1800);
        });
      };

      const isAckError = (payload: any) => {
        if (!payload) return false;
        if (payload?.ok === false) return true;
        if (typeof payload?.error === 'string' && payload.error.trim().length > 0) return true;
        if (typeof payload?.message === 'string' && /error|failed/i.test(payload.message)) return true;
        return false;
      };

      const ensureJoined = async (targetConversationId: number): Promise<boolean> => {
        if (!targetConversationId || targetConversationId <= 0) return false;
        if (joinedConversationId === targetConversationId) return true;
        return await new Promise<boolean>((resolve) => {
          let settled = false;
          const done = (ok: boolean) => {
            if (settled) return;
            settled = true;
            resolve(ok);
          };
          setJoiningConversationId(targetConversationId);
          supportWidgetEvents.joinRoom({ conversationId: targetConversationId }, (ack: any) => {
            const hasError = Boolean(
              ack?.error ||
                ack?.ok === false ||
                (typeof ack?.message === 'string' && /not a participant/i.test(ack.message)),
            );
            done(!hasError);
          });
          window.setTimeout(() => done(false), 1500);
        });
      };

      const handleAck = (raw: any): boolean => {
        const envelope =
          raw?.message && typeof raw.message === 'object'
            ? raw.message
            : raw?.data && typeof raw.data === 'object'
              ? raw.data
              : raw?.payload && typeof raw.payload === 'object'
                ? raw.payload
                : raw;
        const saved =
          envelope?.message && typeof envelope.message === 'object'
            ? envelope.message
            : envelope;
        const conversationIdFromAck =
          Number(
            raw?.conversationId ??
              raw?.conversation_ID ??
              raw?.roomId ??
              envelope?.conversationId ??
              envelope?.conversation_ID ??
              envelope?.roomId ??
              saved?.conversationId ??
              saved?.conversation_ID ??
              saved?.roomId ??
              0,
          ) || 0;
        if (!conversationIdFromAck) return false;

        // Reuse the same normalization used for incoming socket payloads.
        const createdAt =
          typeof saved?.createdAt === 'number'
            ? saved.createdAt
            : saved?.createdAt
              ? Date.parse(String(saved.createdAt)) || Date.now()
              : Date.now();

        const senderRaw = saved?.sender ?? saved?.fromUser ?? saved?.user ?? raw?.sender ?? raw?.fromUser ?? raw?.user ?? raw?.staff;

        const sender =
          senderRaw && typeof senderRaw === 'object'
            ? {
                userId: Number(senderRaw.userId ?? senderRaw.user_ID ?? senderRaw.id ?? senderRaw.senderUserId ?? senderRaw.fromUserId ?? 0) || myUserId,
                name: typeof senderRaw.name === 'string' ? senderRaw.name : 'You',
                avatarUrl: typeof senderRaw.avatarUrl === 'string' ? senderRaw.avatarUrl : typeof senderRaw.avatar === 'string' ? senderRaw.avatar : undefined,
              }
            : { userId: myUserId, name: 'You' };

        const normalized: any = {
          ...saved,
          conversationId: conversationIdFromAck,
          id: saved?.id ?? saved?.messageId ?? `${conversationIdFromAck}-${createdAt}`,
          createdAt,
          type: saved?.type === 'action' ? 'action' : 'text',
          sender,
        };
        if (normalized.type === 'text') {
          normalized.content = String(saved?.content ?? saved?.text ?? saved?.message ?? content);
          if (!normalized.content.trim()) return false;
        }

        reconcileOptimisticIfMatch(normalized);
        appendIncoming({ conversationId: conversationIdFromAck, message: normalized });
        setConversationId(conversationIdFromAck);
        return true;
      };

      if (!conversationId || conversationId === FALLBACK_DRAFT_ID) {
        const ack = await sendWithAck({
          ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
          message: { type: 'text', content },
        });
        if (!ack) throw new Error('Socket timeout');
        if (isNotParticipantError(ack)) {
          toastError(i18nKeys.toast.support.joinThreadFailed);
        }
        if (isAckError(ack)) throw new Error(typeof ack?.error === 'string' ? ack.error : 'Socket send failed');
        const handled = handleAck(ack);
        if (!handled) throw new Error('Socket ack missing message payload');
      } else {
        const joined = await ensureJoined(conversationId);
        if (!joined) {
          // Existing thread may belong to another user. Fall back to customer auto-assign flow.
          resetConversationContext();
          const fallbackAck = await sendWithAck({
            ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
            message: { type: 'text', content },
          });
          if (!fallbackAck) throw new Error('Socket timeout');
          if (isAckError(fallbackAck)) throw new Error(typeof fallbackAck?.error === 'string' ? fallbackAck.error : 'Socket send failed');
          const handledFallback = handleAck(fallbackAck);
          if (!handledFallback) throw new Error('Socket ack missing message payload');
          return;
        }
        const ack = await sendWithAck({
          conversationId,
          ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
          message: { type: 'text', content },
        });
        if (!ack) throw new Error('Socket timeout');
        if (isNotParticipantError(ack)) {
          // Conversation ownership can change while persisted state still points to old thread.
          resetConversationContext();
          const fallbackAck = await sendWithAck({
            ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
            message: { type: 'text', content },
          });
          if (!fallbackAck) throw new Error('Socket timeout');
          if (isAckError(fallbackAck)) throw new Error(typeof fallbackAck?.error === 'string' ? fallbackAck.error : 'Socket send failed');
          const handledFallback = handleAck(fallbackAck);
          if (!handledFallback) throw new Error('Socket ack missing message payload');
          return;
        }
        if (isAckError(ack)) throw new Error(typeof ack?.error === 'string' ? ack.error : 'Socket send failed');
        const handled = handleAck(ack);
        if (!handled) throw new Error('Socket ack missing message payload');
      }
    } catch (err: any) {
      try {
        const saved = !conversationId || conversationId === FALLBACK_DRAFT_ID
          ? await supportWidgetApi.postMessage({
              ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
              type: 'text',
              content,
            })
          : await supportWidgetApi.postMessage({
              conversationId,
              ...(staffUserId && staffUserId > 0 ? { recipientUserId: staffUserId } : {}),
              type: 'text',
              content,
            });
        if (saved) {
          const normalizedSaved: any = {
            ...saved,
            type: saved.type === 'action' ? 'action' : 'text',
            sender:
              saved.sender && Number((saved.sender as any).userId ?? 0) > 0
                ? saved.sender
                : { userId: myUserId, name: 'You' },
          };
          if (normalizedSaved.type === 'text') {
            normalizedSaved.content = String((saved as any).content ?? '').trim() || content;
          }
          reconcileOptimisticIfMatch(normalizedSaved);
          appendIncoming({ conversationId: normalizedSaved.conversationId, message: normalizedSaved });
          setConversationId(normalizedSaved.conversationId ?? conversationId ?? null);
          markOptimisticSent(clientId);
          return;
        }
        markOptimisticSent(clientId);
      } catch (restErr: any) {
        markOptimisticFailed(clientId);
        toastErrorWithFallback(
          i18nKeys.toast.support.sendFailed,
          restErr?.message ? String(restErr.message) : err?.message ? String(err.message) : undefined,
        );
      }
    } finally {
    }
  };

  if (!enabled) return null;

  return (
    <>
      {!isOpen ? (
        <SupportWidgetButton unreadCount={unreadCount} onClick={() => setOpen(true)} />
      ) : (
        <>
          <div
            className="fixed inset-0 z-[59] bg-black/20 sm:bg-black/0"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <SupportWidgetPanel
            onClose={() => setOpen(false)}
            statusText={statusText}
            loadingMessages={loadingMessages}
            onSend={onSend}
          />
        </>
      )}
    </>
  );
};

