// Domain: Messaging (chat + support chat + customer-support widget logic)
// Incremental migration: re-export existing modules first, then we can move files safely.

export * from '@/features/chat/types';

// Avoid name collisions (JoinRoomPayload/SendMessagePayload/ReceiveMessagePayload exist in multiple modules).
export type {
  JoinRoomPayload as SupportChatJoinRoomPayload,
  SendMessagePayload as SupportChatSendMessagePayload,
  ReceiveMessagePayload as SupportChatReceiveMessagePayload,
} from '@/features/supportChat/types';

export type {
  JoinRoomPayload as SupportWidgetJoinRoomPayload,
  SendMessagePayload as SupportWidgetSendMessagePayload,
  ReceiveMessagePayload as SupportWidgetReceiveMessagePayload,
} from '@/features/customerSupportWidget/types';

export { chatEvents } from '@/features/chat/socket/chatEvents';
export { connectSocket, disconnectSocket, getSocket, getSocketStatus } from '@/features/chat/socket/socketClient';

export {
  connectSupportChatSocket,
  disconnectSupportChatSocket,
  supportChatEvents,
} from '@/features/supportChat/socket/supportChat.socket';

export {
  connectSupportWidgetSocket,
  disconnectSupportWidgetSocket,
  supportWidgetEvents,
} from '@/features/customerSupportWidget/socket/supportWidget.socket';

