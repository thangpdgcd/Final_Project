import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BACKEND_BASE = 'http://localhost:8080';

type CallbackSuccess = {
  access_token?: string;
  user?: unknown;
  [k: string]: unknown;
};

const pretty = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const TikTokCallbackPage: React.FC = () => {
  const location = useLocation();

  const { code, state } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      code: params.get('code') ?? '',
      state: params.get('state') ?? '',
    };
  }, [location.search]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [payload, setPayload] = useState<CallbackSuccess | null>(null);

  useEffect(() => {
    const trimmedCode = code.trim();
    const trimmedState = state.trim();

    if (!trimmedCode || !trimmedState) {
      setStatus('error');
      setError('Missing OAuth query params. Expected `code` and `state`.');
      return;
    }

    let alive = true;
    setStatus('loading');
    setError('');

    const url = `${BACKEND_BASE}/auth/tiktok/callback?code=${encodeURIComponent(
      trimmedCode,
    )}&state=${encodeURIComponent(trimmedState)}`;

    (async () => {
      try {
        const res = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || `Request failed (${res.status})`);
        }
        const json = (await res.json()) as CallbackSuccess;
        if (!alive) return;

        const token =
          typeof json?.access_token === 'string'
            ? json.access_token
            : typeof (json as any)?.data?.access_token === 'string'
              ? (json as any).data.access_token
              : typeof (json as any)?.token === 'string'
                ? (json as any).token
                : '';

        if (token) localStorage.setItem('tiktok_access_token', token);
        setPayload(json);
        setStatus('success');
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus('error');
        setError(msg || 'Callback failed');
      }
    })();

    return () => {
      alive = false;
    };
  }, [code, state]);

  const token =
    typeof payload?.access_token === 'string'
      ? payload.access_token
      : typeof (payload as any)?.data?.access_token === 'string'
        ? (payload as any).data.access_token
        : typeof (payload as any)?.token === 'string'
          ? (payload as any).token
          : '';

  const userInfo =
    payload && typeof (payload as any)?.user !== 'undefined'
      ? (payload as any).user
      : payload && typeof (payload as any)?.data?.user !== 'undefined'
        ? (payload as any).data.user
        : payload && typeof (payload as any)?.data?.userInfo !== 'undefined'
          ? (payload as any).data.userInfo
          : null;

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem-6rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  TikTok OAuth
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Callback Processing
                </h1>
                <p className="mt-2 text-sm text-white/75">
                  We are validating the callback and exchanging the authorization code.
                </p>
              </div>
              <div
                className={[
                  'rounded-xl px-3 py-1 text-xs font-bold',
                  status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : status === 'error'
                      ? 'bg-rose-500/15 text-rose-200'
                      : 'bg-white/10 text-white/70',
                ].join(' ')}
              >
                {status === 'loading'
                  ? 'LOADING'
                  : status === 'success'
                    ? 'SUCCESS'
                    : status === 'error'
                      ? 'ERROR'
                      : 'IDLE'}
              </div>
            </div>

            <div className="mt-6">
              {status === 'loading' && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <div className="text-sm text-white/80">Processing TikTok callback…</div>
                  </div>
                  <div className="mt-3 text-xs text-white/60">
                    code: <span className="font-mono">{code ? 'present' : 'missing'}</span> · state:{' '}
                    <span className="font-mono">{state ? 'present' : 'missing'}</span>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="text-sm font-bold text-rose-200">Callback failed</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-rose-100/90">{error}</div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="text-sm font-bold text-emerald-200">Authenticated</div>
                    <div className="mt-2 text-xs text-emerald-100/80">
                      Stored token at <span className="font-mono">localStorage.tiktok_access_token</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                      access_token
                    </div>
                    <div className="mt-2 break-all rounded-lg bg-black/30 p-3 font-mono text-[12px] text-white/90">
                      {token || '(not found in response)'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                      user_info
                    </div>
                    <pre className="mt-2 max-h-[320px] overflow-auto rounded-lg bg-black/30 p-3 text-[12px] text-white/90">
                      {pretty(userInfo ?? payload)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokCallbackPage;

