import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
const proxyTargetFromEnv = (env: Record<string, string>) => {
  // Prefer VITE_API_URL if set; normalize to origin (strip /api)
  const raw = (env.VITE_API_URL ?? '').trim();
  if (raw) {
    const normalized = raw.replace(/\/+$/, '').replace(/\/api\/?$/i, '');
    return normalized;
  }
  return 'http://localhost:8080';
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = proxyTargetFromEnv(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      headers: {
        // Needed for Google Sign-In popup communication in some browsers.
        // Avoids `Cross-Origin-Opener-Policy policy would block window.postMessage`.
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        // Allow frontend to call `/api/*` without CORS in dev.
        '/api': {
          target,
          changeOrigin: true,
        },
        // Socket.IO websocket upgrade
        '/socket.io': {
          target,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
    build: {
      outDir: 'dist',
      // Sourcemaps are helpful in dev but add weight/leakage in production.
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
