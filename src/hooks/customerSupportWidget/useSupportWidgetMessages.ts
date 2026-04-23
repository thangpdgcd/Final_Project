import { useEffect } from 'react';
import { i18nKeys } from '@/translates/constants/i18nKeys';
import { toastErrorWithFallback } from '@/utils/lib/toast/i18nToast';
import { supportWidgetApi } from '@/features/customerSupportWidget/api/supportWidget.api';
import { useSupportWidgetStore } from '@/features/customerSupportWidget/store/useSupportWidgetStore';

type Options = {
  enabled: boolean;
  conversationId: number | null;
};

export const useSupportWidgetMessages = ({ enabled, conversationId }: Options) => {
  useEffect(() => {
    if (!enabled) return;
    // Draft/unknown conversation ids (<=0) are client-only; do not hit REST.
    if (!conversationId || conversationId <= 0) return;

    const state = useSupportWidgetStore.getState();
    if (state.loadingMessages) return;
    if (state.loadedConversationId === conversationId) return;

    let cancelled = false;
    state.setLoadingMessages(true);
    supportWidgetApi
      .getMessages(conversationId, { limit: 50, offset: 0 })
      .then((messages) => {
        if (cancelled) return;
        const s = useSupportWidgetStore.getState();

        // Merge fetched history with any messages already appended via realtime/optimistic,
        // so UI doesn't "flash then disappear" when the fetch completes.
        const existing = s.messages ?? [];
        const byId = new Map<string, any>();
        for (const m of existing) byId.set(String(m.id), m);
        for (const m of messages) byId.set(String(m.id), m);
        const merged = Array.from(byId.values()).sort(
          (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0),
        );

        s.setMessages(merged);
        s.setLoadedConversationId(conversationId);
      })
      .catch((err) => {
        if (cancelled) return;
        toastErrorWithFallback(
          i18nKeys.toast.support.loadMessagesFailed,
          err?.message ? String(err.message) : undefined,
        );
        // Avoid an infinite skeleton if the endpoint rejects or is temporarily down.
        useSupportWidgetStore.getState().setLoadedConversationId(conversationId);
      })
      .finally(() => {
        // Always reset loading; do NOT update state in the cleanup below.
        useSupportWidgetStore.getState().setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, enabled]);
};

