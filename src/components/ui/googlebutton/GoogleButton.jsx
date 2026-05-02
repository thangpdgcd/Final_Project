import React from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

export const GoogleButton = ({ onToken, loading, disabled, className = '', containerRef }) => {
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()

  // If the environment is missing the client id, don't render GoogleLogin
  // (it would crash outside GoogleOAuthProvider). Keep the button area inert.
  if (!clientId) {
    return (
      <div ref={containerRef} className={`relative inline-flex ${className}`}>
        <div className="pointer-events-none opacity-60">
          <div
            aria-hidden="true"
            className="h-[40px] w-[40px] rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
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
            type="icon"
            shape="circle"
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

