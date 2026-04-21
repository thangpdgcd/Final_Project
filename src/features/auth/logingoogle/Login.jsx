import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuthApi } from '@/api/googles/googleAuthApi';
import { GoogleButton } from '@/components/ui/googlebutton/GoogleButton';
import { useAuth } from '@/store/auth/AuthContext';

const getErrorMessage = (err) => {
  const respMessage = err?.response?.data?.message ?? err?.response?.data?.error;
  return String(respMessage ?? err?.message ?? 'Login failed').trim();
};

const Login = () => {
  const navigate = useNavigate();
  const { login: loginCtx } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const canUseGoogle = Boolean(clientId);

  const subtitle = useMemo(() => {
    return 'Sign in to continue to your account';
  }, []);

  const handleGoogleToken = async (token) => {
    if (!token) {
      setError('Google login was cancelled or failed. Please try again.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const { accessToken, user } = await googleAuthApi.login(token);

      // Keep compatibility with existing app auth layer.
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      if (user) {
        loginCtx(accessToken, user);
      } else {
        // If backend returns JWT only, we still redirect; AuthContext will hydrate later if possible.
        window.dispatchEvent(new Event('auth:updated'));
      }

      navigate('/', { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 py-10 sm:py-14 grid place-items-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
      <div className="w-full max-w-[420px]">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/90 backdrop-blur shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                Welcome back
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                Login
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
            </div>

            {!canUseGoogle ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                Missing <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span>. Please set it
                in your <span className="font-semibold">.env</span> and restart the dev server.
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-3">
                  <GoogleButton
                    onToken={handleGoogleToken}
                    loading={loading}
                    disabled={!canUseGoogle || loading}
                  />
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Continue with Google
                  </div>
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
