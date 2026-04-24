import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import '@/translates/i18n';

// Reduce noisy Google Identity console logs when origin is misconfigured.
// This does not fix the underlying OAuth config issue (Authorized JS origins).
const suppressNoisyConsole =
  String(import.meta.env.VITE_SUPPRESS_NOISY_CONSOLE ?? '').trim() === '1' || import.meta.env.DEV;

if (suppressNoisyConsole) {
  const shouldSuppress = (args: unknown[]) => {
    const text = args
      .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : ''))
      .join(' ')
      .toLowerCase();
    return (
      text.includes('gsi_logger') ||
      text.includes('credential_button_library') ||
      text.includes('origin is not allowed') ||
      text.includes('cross-origin-opener-policy')
    );
  };

  const origError = console.error;
  const origWarn = console.warn;
  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    origError(...args);
  };
  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    origWarn(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    if (shouldSuppress([reason])) {
      event.preventDefault();
    }
  });

  // Some browsers emit "Failed to load resource" for GSI iframes/scripts directly (not via console.*).
  // Best-effort suppression; keep the filter narrow.
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as (EventTarget & { src?: unknown; href?: unknown }) | null;
      const src = String(target?.src ?? target?.href ?? '');
      if (src.includes('accounts.google.com/gsi/') || src.includes('google.com/gsi/')) {
        event.preventDefault();
        (event as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.();
        return;
      }
    },
    true,
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

