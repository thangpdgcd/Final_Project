import React from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

export const GoogleButton = ({ onToken, loading, disabled, className = '', containerRef }) => {
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()

  // If the environment is missing the client id, don't render GoogleLogin
  // (it would crash outside GoogleOAuthProvider). Keep the button area inert.
  if (!clientId) {
    return (
      <div ref={containerRef} className={`relative inline-flex ${className}`}>
        <button
          type="button"
          disabled
          className="pointer-events-none inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-500 opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
          aria-label="Google login is not configured"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-[11px] font-black text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            G
          </span>
          Google (chưa cấu hình)
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative inline-flex w-full ${className}`}>
      <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const token = credentialResponse?.credential
              onToken?.(token)
            }}
            onError={() => {
              onToken?.(null)
            }}
            useOneTap={false}
            theme="outline"
            size="large"
            type="standard"
            shape="pill"
            locale="vi"
          />
        </GoogleOAuthProvider>
      </div>

      {loading ? (
        <div className="absolute inset-0 grid place-items-center rounded-md bg-white/60 backdrop-blur-sm dark:bg-zinc-950/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        </div>
      ) : null}
    </div>
  )
}

