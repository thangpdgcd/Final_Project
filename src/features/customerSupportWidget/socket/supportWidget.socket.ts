import type { Socket } from 'socket.io-client';
import { connectSocket, getSocket, getSocketStatus } from '@/features/chat/socket/socketClient';
import type { JoinRoomPayload, ReceiveMessagePayload, SendMessagePayload } from '../types';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export const getSupportWidgetSocketStatus = (): SocketStatus => getSocketStatus() as SocketStatus;
export const getSupportWidgetSocket = (): Socket | null => getSocket();

export const connectSupportWidgetSocket = () => {
  return connectSocket();
};

export const disconnectSupportWidgetSocket = () => {
  // Intentionally no-op: socket is shared across modules.
};

export const supportWidgetEvents = {
  joinRoom: (payload: JoinRoomPayload, ack?: (res: any) => void) => {
    const socket = connectSupportWidgetSocket();
    const normalizedPayload =
      payload && typeof (payload as any).conversationId === 'number'
        ? { ...(payload as any), roomId: (payload as any).conversationId }
        : payload;
    socket.emit('join_room', normalizedPayload, ack);
  },

  sendMessage: (payload: SendMessagePayload, ack?: (res: any) => void) => {
    const socket = connectSupportWidgetSocket();
    const normalizedPayload =
      payload && typeof (payload as any).conversationId === 'number'
        ? { ...(payload as any), roomId: (payload as any).conversationId }
        : payload;
    socket.emit('send_message', normalizedPayload, ack);
  },

  onJoinedRoom: (handler: (payload: any) => void) => {
    const socket = connectSupportWidgetSocket();
    socket.on('joined_room', handler);
    socket.on('chat:join', handler);
    return () => {
      socket.off('joined_room', handler);
      socket.off('chat:join', handler);
    };
  },

  onReceiveMessage: (handler: (payload: ReceiveMessagePayload) => void) => {
    const socket = connectSupportWidgetSocket();
    socket.on('receive_message', handler as any);
    socket.on('chat:message', handler as any);
    return () => {
      socket.off('receive_message', handler as any);
      socket.off('chat:message', handler as any);
    };
  },

  onError: (handler: (payload: any) => void) => {
    const socket = connectSupportWidgetSocket();
    socket.on('error', handler);
    return () => socket.off('error', handler);
  },
};

