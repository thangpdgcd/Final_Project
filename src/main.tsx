import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/translates/i18n';

// DEV-only: reduce noisy Google Identity console logs when origin is misconfigured.
// This does not fix the underlying OAuth config issue (Authorized JS origins).
if (import.meta.env.DEV) {
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
  const origLog = console.log;
  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    origError(...args);
  };
  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    origWarn(...args);
  };
  console.log = (...args) => {
    if (shouldSuppress(args)) return;
    origLog(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    if (shouldSuppress([reason])) {
      event.preventDefault();
    }
  });

  // Some browsers emit "Failed to load resource" for GSI iframes/scripts directly (not via console.*).
  // Best-effort suppression in DEV only.
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as any;
      const src = String(target?.src ?? target?.href ?? '');
      if (src.includes('accounts.google.com/gsi/') || src.includes('google.com/gsi/')) {
        event.preventDefault();
        (event as any).stopImmediatePropagation?.();
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

