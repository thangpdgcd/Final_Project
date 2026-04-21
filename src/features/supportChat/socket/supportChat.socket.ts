import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/api/http/tokenStore';
import type { JoinRoomPayload, ReceiveMessagePayload, SendMessagePayload } from '../types';

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

export const getSupportChatSocketStatus = () => status;
export const getSupportChatSocket = () => socketSingleton;

export const connectSupportChatSocket = () => {
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
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: token ? { token } : undefined,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    timeout: 10000,
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

export const disconnectSupportChatSocket = () => {
  if (!socketSingleton) return;
  try {
    socketSingleton.removeAllListeners();
    socketSingleton.disconnect();
  } finally {
    socketSingleton = null;
    status = 'disconnected';
  }
};

export const supportChatEvents = {
  joinRoom: (payload: JoinRoomPayload, ack?: (res: any) => void) => {
    const socket = connectSupportChatSocket();
    const normalizedPayload =
      payload && typeof (payload as any).conversationId === 'number'
        ? { ...(payload as any), roomId: (payload as any).conversationId }
        : payload;
    socket.emit('join_room', normalizedPayload as any, ack);
  },

  sendMessage: (payload: SendMessagePayload, ack?: (res: any) => void) => {
    const socket = connectSupportChatSocket();
    const normalizedPayload =
      payload && typeof (payload as any).conversationId === 'number'
        ? { ...(payload as any), roomId: (payload as any).conversationId }
        : payload;
    socket.emit('send_message', normalizedPayload as any, ack);
  },

  onReceiveMessage: (handler: (payload: ReceiveMessagePayload) => void) => {
    const socket = connectSupportChatSocket();
    socket.on('receive_message', handler as any);
    socket.on('chat:message', handler as any);
    return () => {
      socket.off('receive_message', handler as any);
      socket.off('chat:message', handler as any);
    };
  },

  onError: (handler: (payload: any) => void) => {
    const socket = connectSupportChatSocket();
    socket.on('error', handler);
    return () => socket.off('error', handler);
  },
};

