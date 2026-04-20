import type {
  ActionEventRequestPayload,
  ActionEventResultPayload,
  JoinRoomPayload,
  ReceiveMessagePayload,
  SendMessagePayload,
} from '../types';
import { connectSocket } from './socketClient';

export const chatEvents = {
  joinRoom: (payload: JoinRoomPayload, ack?: (res: any) => void) => {
    const socket = connectSocket();
    socket.emit('join_room', payload, ack);
  },

  sendMessage: (payload: SendMessagePayload, ack?: (res: any) => void) => {
    const socket = connectSocket();
    socket.emit('send_message', payload, ack);
  },

  /** Persists and broadcasts to all participants (preferred when roomId is a conversation id). */
  sendChatMessage: (payload: SendMessagePayload, ack?: (res: any) => void) => {
    const socket = connectSocket();
    const roomId = payload?.roomId;
    if (!roomId) {
      if (ack) ack({ ok: false, message: 'roomId required' });
      return;
    }
    socket.emit(
      'chat:message',
      {
        ...payload,
        roomId: String(roomId),
        message: payload.message,
      },
      ack,
    );
  },

  onReceiveMessage: (handler: (payload: ReceiveMessagePayload) => void) => {
    const socket = connectSocket();
    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  },

  sendActionEvent: (payload: ActionEventRequestPayload, ack?: (res: any) => void) => {
    const socket = connectSocket();
    socket.emit('action_event', payload, ack);
  },

  onActionEventResult: (handler: (payload: ActionEventResultPayload) => void) => {
    const socket = connectSocket();
    socket.on('action_event', handler);
    return () => socket.off('action_event', handler);
  },
};
