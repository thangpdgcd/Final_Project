import type { Socket } from 'socket.io-client';
import { connectSocket, getSocket, getSocketStatus } from '@/features/chat/socket/socketClient';
import type { JoinRoomPayload, ReceiveMessagePayload, SendMessagePayload } from '../types';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export const getSupportChatSocketStatus = (): SocketStatus => getSocketStatus() as SocketStatus;
export const getSupportChatSocket = (): Socket | null => getSocket();

export const connectSupportChatSocket = () => {
  return connectSocket();
};

export const disconnectSupportChatSocket = () => {
  // Intentionally no-op: socket is shared across modules.
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

