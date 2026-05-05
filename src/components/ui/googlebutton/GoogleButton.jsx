import React, { useEffect, useRef, useState } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

const GSI_SCRIPT_ID = 'google-identity-services'
const GSI_SRC = 'https://accounts.google.com/gsi/client'

export const GoogleButton = ({
  onToken,
  onUnavailable,
  loading,
  disabled,
  className = '',
  containerRef,
}) => {
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
  const [gsiReady, setGsiReady] = useState(false)
  const [gsiFailed, setGsiFailed] = useState(false)
  const didNotifyUnavailableRef = useRef(false)

  useEffect(() => {
    if (!clientId) return

    // If GSI is already available (or previously loaded), mark as ready.
    const hasGsi = Boolean(window?.google?.accounts?.id)
    if (hasGsi) {
      setGsiReady(true)
      return
    }

    let cancelled = false
    let timeoutId = null

    const notifyUnavailableOnce = (reason) => {
      if (didNotifyUnavailableRef.current) return
      didNotifyUnavailableRef.current = true
      onUnavailable?.(reason)
    }

    const existing = document.getElementById(GSI_SCRIPT_ID)
    if (existing) {
      // Script tag exists; give it a moment to initialize.
      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        const ok = Boolean(window?.google?.accounts?.id)
        if (ok) setGsiReady(true)
        else {
          setGsiFailed(true)
          notifyUnavailableOnce('GSI_NOT_AVAILABLE')
        }
      }, 1800)
      return () => {
        cancelled = true
        if (timeoutId) window.clearTimeout(timeoutId)
      }
    }

    const script = document.createElement('script')
    script.id = GSI_SCRIPT_ID
    script.src = GSI_SRC
    script.async = true
    script.defer = true

    script.onload = () => {
      if (cancelled) return
      const ok = Boolean(window?.google?.accounts?.id)
      if (ok) setGsiReady(true)
      else {
        setGsiFailed(true)
        notifyUnavailableOnce('GSI_LOADED_BUT_MISSING')
      }
    }
    script.onerror = () => {
      if (cancelled) return
      setGsiFailed(true)
      notifyUnavailableOnce('GSI_BLOCKED_OR_FAILED')
    }

    document.head.appendChild(script)
    timeoutId = window.setTimeout(() => {
      if (cancelled) return
      const ok = Boolean(window?.google?.accounts?.id)
      if (!ok) {
        setGsiFailed(true)
        notifyUnavailableOnce('GSI_TIMEOUT')
      } else {
        setGsiReady(true)
      }
    }, 2200)

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [clientId, onUnavailable])

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

  if (!gsiReady) {
    const label = gsiFailed ? 'Google (bị chặn)' : 'Google (đang tải...)'
    return (
      <div ref={containerRef} className={`relative inline-flex w-full ${className}`}>
        <button
          type="button"
          disabled
          className="pointer-events-none inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-500 opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
          aria-label={label}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-[11px] font-black text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            G
          </span>
          {label}
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

