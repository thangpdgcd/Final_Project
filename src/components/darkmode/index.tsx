import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "../../app/App";
import '../src/styles/themes.scss';
import './translates/i18n';

const suppressCoopPostMessageNoise = () => {
  if (!import.meta.env.PROD) return;

  const shouldIgnore = (args: unknown[]) => {
    const text = args.map((a) => String(a ?? '')).join(' ');
    return text.includes('Cross-Origin-Opener-Policy policy would block the window.postMessage call');
  };

  const wrap = (fn: (...args: any[]) => void) => (...args: any[]) => {
    if (shouldIgnore(args)) return;
    fn(...args);
  };

  // Some browsers/extensions surface this as warn, others as error.
  console.warn = wrap(console.warn.bind(console));
  console.error = wrap(console.error.bind(console));
};

const initializeTheme = () => {
  const saved = localStorage.getItem('theme');
  const root = document.documentElement;

  if (saved === 'dark') {
    root.classList.add('dark');
  } else if (saved === 'light') {
    root.classList.remove('dark');
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
};

suppressCoopPostMessageNoise();
initializeTheme();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
