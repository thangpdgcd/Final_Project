import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SupportWidgetMessage } from '../types';
import { isNearBottom } from '../utils/scroll';
import { WidgetThreadSkeleton } from './Skeletons';
import { useSupportWidgetStore } from '../store/useSupportWidgetStore';

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

type Props = {
  myUserId: number;
  messages: SupportWidgetMessage[];
  loading: boolean;
};

export const SupportMessageList: React.FC<Props> = ({ myUserId, messages, loading }) => {
  const staffUserId = useSupportWidgetStore((s) => s.staffUserId);
  const lastKnownConversation = useSupportWidgetStore((s) => s.lastKnownConversation);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [autoStick, setAutoStick] = useState(true);

  const staffNameFromConversation = useMemo(() => {
    const staff = (lastKnownConversation?.participants ?? []).find((p) => {
      const role = String(p.roleAtJoin ?? '').toLowerCase();
      return role === 'staff' || role === 'admin' || role === 'support';
    });
    return String(staff?.name ?? '').trim();
  }, [lastKnownConversation?.participants]);

  const isGenericStaffName = (name: string) => /^(user|staff)\s*#?\s*\d+$/i.test(name.trim());

  const sorted = useMemo(() => {
    return [...messages]
      .sort((a, b) => a.createdAt - b.createdAt)
      .filter((m) => (m.type === 'action' ? true : String(m.content ?? '').trim().length > 0));
  }, [messages]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => setAutoStick(isNearBottom(el, 120));
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll as any);
  }, []);

  useEffect(() => {
    if (!autoStick) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [autoStick, sorted.length]);

  if (loading) return <WidgetThreadSkeleton />;

  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-zinc-950 px-3 py-3"
    >
      {sorted.length === 0 ? (
        <div className="mx-auto mt-8 max-w-[240px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs text-zinc-400">
          Start a conversation with support.
        </div>
      ) : (
        sorted.map((m, index) => {
          const mine = (m.sender?.userId ?? 0) === myUserId;
          const prev = index > 0 ? sorted[index - 1] : null;
          const next = index < sorted.length - 1 ? sorted[index + 1] : null;

          const prevMine = prev ? (prev.sender?.userId ?? 0) === myUserId : null;
          const nextMine = next ? (next.sender?.userId ?? 0) === myUserId : null;
          const gapFromPrev = prev ? m.createdAt - prev.createdAt : Number.MAX_SAFE_INTEGER;
          const gapToNext = next ? next.createdAt - m.createdAt : Number.MAX_SAFE_INTEGER;

          const startsGroup = !prev || prevMine !== mine || gapFromPrev > 5 * 60_000;
          const endsGroup = !next || nextMine !== mine || gapToNext > 5 * 60_000;

          const senderName = !mine
            ? (() => {
                const raw = (m.sender?.name ?? '').trim();
                if (raw && !isGenericStaffName(raw)) return raw;
                if (staffNameFromConversation) return staffNameFromConversation;
                if (raw) return raw;
                return staffUserId ? `Staff #${staffUserId}` : 'Support';
              })()
            : '';
          const avatarText = (senderName?.trim()?.[0] ?? 'S').toUpperCase();
          const text = m.type === 'text' ? m.content : `Action: ${m.action}`;

          const bubbleBase = 'max-w-[80%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words';
          const mineBubble = startsGroup
            ? endsGroup
              ? 'rounded-br-md'
              : 'rounded-br-lg'
            : endsGroup
              ? 'rounded-tr-lg rounded-br-md'
              : 'rounded-tr-[8px] rounded-br-[8px]';
          const theirBubble = startsGroup
            ? endsGroup
              ? 'rounded-bl-md'
              : 'rounded-bl-lg'
            : endsGroup
              ? 'rounded-tl-lg rounded-bl-md'
              : 'rounded-tl-[8px] rounded-bl-[8px]';
          const bubble = mine
            ? `${bubbleBase} bg-[#1d7dfa] text-white shadow-[0_4px_18px_rgba(29,125,250,0.35)] ${mineBubble}`
            : `${bubbleBase} border border-white/10 bg-zinc-800 text-zinc-100 ${theirBubble}`;

          return (
            <div
              key={String(m.id) + (m.optimistic?.clientId ?? '')}
              className={[
                'flex',
                mine ? 'justify-end' : 'justify-start',
                startsGroup ? 'mt-3' : 'mt-1.5',
              ].join(' ')}
            >
              {!mine ? (
                <div className="mr-2 w-8 shrink-0 self-end">
                  {endsGroup ? (
                    <div className="h-8 w-8 rounded-full border border-white/10 bg-zinc-700 grid place-items-center text-[11px] font-semibold text-white">
                      {avatarText}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className={mine ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
                {!mine && startsGroup && senderName ? (
                  <div className="mb-1 ml-1 text-[12px] font-medium text-zinc-300">{senderName}</div>
                ) : null}
                <div className={bubble}>{text}</div>
                {endsGroup ? (
                  <div className={mine ? 'mt-1 text-[10px] text-right text-zinc-500' : 'mt-1 text-[10px] text-zinc-500'}>
                    {formatTime(m.createdAt)}
                    {m.optimistic?.status === 'sending' ? ' · Sending…' : null}
                    {m.optimistic?.status === 'failed' ? ' · Failed' : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
};

