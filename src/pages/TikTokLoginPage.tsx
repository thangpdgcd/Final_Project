import React, { useMemo } from 'react';

const BACKEND_BASE = 'http://localhost:8080';

const TikTokLoginPage: React.FC = () => {
  const oauthStartUrl = useMemo(() => `${BACKEND_BASE}/auth/tiktok`, []);

  const onLogin = () => {
    window.location.href = oauthStartUrl;
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#111827] px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem-6rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  OAuth Login
                </div>
                <h1 className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  Sign in with TikTok
                </h1>
                <p className="mt-2 text-sm text-white/75">
                  Continue securely using TikTok. We’ll redirect you to authorize, then bring you back here.
                </p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                <span className="text-lg font-black">TT</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onLogin}
                className={[
                  'group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl',
                  'bg-gradient-to-r from-[#ff2d55] via-[#7c3aed] to-[#22c55e] px-5 py-3.5',
                  'text-base font-bold text-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]',
                  'transition-transform duration-200 will-change-transform',
                  'hover:-translate-y-0.5 hover:scale-[1.01]',
                  'active:translate-y-0 active:scale-[0.99]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]',
                ].join(' ')}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/18 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-sm font-black">
                    ♪
                  </span>
                  <span>Login with TikTok</span>
                </span>
              </button>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                Redirect URL:
                <div className="mt-1 break-all font-mono text-[11px] text-white/80">{oauthStartUrl}</div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-white/55">
              By continuing, you agree to our terms and acknowledge our privacy policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokLoginPage;

