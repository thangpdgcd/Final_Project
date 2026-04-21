import React from 'react'
import { GoogleLogin } from '@react-oauth/google'

export const GoogleButton = ({ onToken, loading, disabled, className = '', containerRef }) => {
  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
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
      </div>

      {loading ? (
        <div className="absolute inset-0 grid place-items-center rounded-md bg-white/60 backdrop-blur-sm dark:bg-zinc-950/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        </div>
      ) : null}
    </div>
  )
}

