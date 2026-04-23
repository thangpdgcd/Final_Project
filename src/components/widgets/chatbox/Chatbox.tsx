import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Talk from 'talkjs';
import { MessageCircle, X } from 'lucide-react';
import { useTheme } from '@/store/themes/ThemeContext';

type AnyUser = Record<string, any> | null | undefined;

const safeUserFields = (user: AnyUser) => {
  const id = user?.id ?? user?.user_ID ?? user?.userId ?? user?.userid ?? user?.email ?? 'user';
  const name = user?.name ?? user?.fullName ?? user?.username ?? user?.email ?? 'User';
  const email = user?.email ?? '';
  const photoUrl = user?.avatar ?? user?.photoUrl ?? user?.image ?? undefined;
  return { id: String(id), name: String(name), email: String(email), photoUrl };
};

type ChatboxProps = {
  loggedInUser?: AnyUser;
};

const Chatbox: React.FC<ChatboxProps> = ({ loggedInUser = null }) => {
  const appId = (import.meta as any).env?.VITE_TALKJS_APP_ID as string | undefined;
  const talkThemeEnv = (import.meta as any).env?.VITE_TALKJS_THEME as string | undefined;
  const { dark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatboxReady, setChatboxReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitLoading, setIsInitLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chatboxRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  const me = useMemo(() => safeUserFields(loggedInUser), [loggedInUser]);
  const talkTheme = useMemo(() => {
    if (talkThemeEnv && String(talkThemeEnv).trim()) return String(talkThemeEnv).trim();
    return dark ? 'default_dark' : 'default';
  }, [dark, talkThemeEnv]);

  useEffect(() => {
    setInitError(null);
    setChatboxReady(false);

    if (!appId) return;
    if (String(appId).trim().toUpperCase() === 'YOUR_APP_ID') {
      setInitError('Missing TalkJS App ID. Set VITE_TALKJS_APP_ID in .env.');
      return;
    }
    if (!loggedInUser) return;
    if (!me?.id) return;

    let mounted = true;
    setIsInitLoading(true);

    Talk.ready
      .then(() => {
        if (!mounted) return;

        const session = new Talk.Session({
          appId,
          me: new Talk.User({
            id: me.id,
            name: me.name,
            email: me.email ? [me.email] : undefined,
            photoUrl: me.photoUrl,
            role: 'user',
          }),
        });

        sessionRef.current = session;

        const admin = new Talk.User({
          id: 'admin',
          name: 'Admin Support',
          email: ['admin@support.local'],
          role: 'admin',
        });

        const conversationId = Talk.oneOnOneId(session.me, admin);
        const conversation = session.getOrCreateConversation(conversationId);
        conversation.setParticipant(session.me);
        conversation.setParticipant(admin);

        const chatbox = (session as any).createChatbox(conversation, {
          showChatHeader: true,
          theme: talkTheme,
        });

        chatboxRef.current = chatbox;
        setChatboxReady(true);
        setIsInitLoading(false);

        const inbox = (session as any).createInbox({ selected: conversation });
        (inbox as any).on('unreadCountChange', (count: number) => {
          if (!mounted) return;
          setUnreadCount(Number(count) || 0);
        });

        if (containerRef.current && isOpen) {
          chatbox.mount(containerRef.current);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsInitLoading(false);
        setInitError('TalkJS failed to load. Please verify App ID and allow network access.');
      });

    return () => {
      mounted = false;
      try {
        chatboxRef.current?.destroy?.();
      } catch {
        // ignore
      }
      chatboxRef.current = null;
      setChatboxReady(false);

      try {
        sessionRef.current?.destroy?.();
      } catch {
        // ignore
      }
      sessionRef.current = null;
      setIsInitLoading(false);
    };
  }, [appId, loggedInUser, me.id, me.name, me.email, me.photoUrl, isOpen, talkTheme]);

  useEffect(() => {
    if (!isOpen) return;
    const chatbox = chatboxRef.current;
    if (!chatbox) return;
    if (!containerRef.current) return;
    try {
      chatbox.mount(containerRef.current);
    } catch {
      // ignore
    }
  }, [isOpen, chatboxReady]);

  if (!appId || !loggedInUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6c59a] text-black shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:brightness-95 transition"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full bg-black px-1 text-xs font-bold text-[#d6c59a] border border-white/10">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mt-3 w-[92vw] max-w-[380px] h-[68vh] max-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
          >
            {initError ? (
              <div className="h-full w-full p-4 text-sm text-zinc-200">
                <div className="font-semibold text-[#d6c59a]">Chat unavailable</div>
                <div className="mt-2 text-zinc-200/90">{initError}</div>
                <div className="mt-3 text-xs text-zinc-400">
                  After updating <code className="text-zinc-200">.env</code>, restart{' '}
                  <code className="text-zinc-200">npm run dev</code>.
                </div>
              </div>
            ) : isInitLoading && !chatboxReady ? (
              <div className="h-full w-full grid place-items-center">
                <div className="text-xs text-zinc-300">Loading chat…</div>
              </div>
            ) : (
              <div className="h-full w-full" ref={containerRef} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbox;

