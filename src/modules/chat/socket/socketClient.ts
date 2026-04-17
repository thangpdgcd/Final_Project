import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/shared/lib/http/tokenStore';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

let socketSingleton: Socket | null = null;
let status: SocketStatus = 'idle';
let socketIoUnsupported = false;

const stripTrailingApi = (raw: string): string => raw.replace(/\/api\/?$/i, '').replace(/\/+$/, '');

const getSocketUrl = () => {
  const explicit = (import.meta as any).env?.VITE_SOCKET_URL as string | undefined;
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;

  const fromExplicit = explicit && String(explicit).trim();
  if (fromExplicit) return stripTrailingApi(fromExplicit);

  const fromApi = apiUrl && String(apiUrl).trim();
  if (fromApi) return stripTrailingApi(fromApi);

  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'http://localhost:8080';
};

export const getSocketStatus = () => status;

export const getSocket = () => socketSingleton;

export const connectSocket = () => {
  if (socketIoUnsupported) {
    status = 'error';
    return socketSingleton as Socket;
  }
  if (socketSingleton && socketSingleton.connected) return socketSingleton;
  if (socketSingleton && socketSingleton.active) return socketSingleton;

  status = 'connecting';
  const url = getSocketUrl();
  const token = getAccessToken();

  socketSingleton = io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: token ? { token } : undefined,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    timeout: 8000,
  });

  socketSingleton.on('connect', () => {
    status = 'connected';
  });
  socketSingleton.on('disconnect', () => {
    status = 'disconnected';
  });
  socketSingleton.on('connect_error', (err: any) => {
    status = 'error';
    const msg = String(err?.message ?? err ?? '');
    if (msg.includes('404') || msg.toLowerCase().includes('unexpected response code: 404')) {
      socketIoUnsupported = true;
      try {
        (socketSingleton as any).io.opts.reconnection = false;
        (socketSingleton as any).io.opts.autoConnect = false;
      } catch {
        // ignore
      }
      try {
        socketSingleton?.disconnect();
      } catch {
        // ignore
      }
    }
  });

  return socketSingleton;
};

export const disconnectSocket = () => {
  if (!socketSingleton) return;
  try {
    socketSingleton.removeAllListeners();
    socketSingleton.disconnect();
  } finally {
    socketSingleton = null;
    status = 'disconnected';
  }
};

