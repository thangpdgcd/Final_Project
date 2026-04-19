import type { Socket } from 'socket.io-client';
import { connectSocket, getSocket } from '@/modules/chat/socket/socketClient';

let joinedForUserId: number | null = null;

export const ensureSocketConnected = (): Socket => {
  const existing = getSocket();
  if (existing) return existing;
  return connectSocket();
};

export const joinNotificationsRoom = (userId: number) => {
  if (!Number.isFinite(userId) || userId <= 0) return;
  if (joinedForUserId === userId) return;
  const socket = ensureSocketConnected();
  // Try a couple of common event names/payload shapes.
  socket.emit('join_room', { userId });
  socket.emit('joinRoom', { userId });
  socket.emit('join_notifications', { userId });
  socket.emit('joinNotifications', userId);
  joinedForUserId = userId;
};

export const resetJoinedRoom = () => {
  joinedForUserId = null;
};

