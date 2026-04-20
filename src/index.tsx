import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '@/App';
import reportWebVitals from './reportWebVitals';
import '../src/styles/themes.scss';
import './translates/i18n';

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

initializeTheme();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

reportWebVitals();
