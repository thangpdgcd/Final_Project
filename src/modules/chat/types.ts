export type ChatRole = 'user' | 'admin' | 'staff';

export type ChatUserRef = {
  id: string;
  name: string;
  role: ChatRole;
};

export type Conversation = {
  roomId: string;
  title: string;
  lastMessagePreview?: string;
  unreadCount?: number;
};

export type FormFieldType = 'text' | 'number' | 'select' | 'switch';

export type FormFieldOption = {
  label: string;
  value: string | number;
};

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
};

export type FormSchema = {
  fields: FormField[];
  submitLabel?: string;
};

export type EditUserAction = {
  kind: 'edit_user';
  title: string;
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  targetUserId: number;
};

export type EditStaffAction = {
  kind: 'edit_staff';
  title: string;
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  targetStaffId: number;
};

export type ChatAction = EditUserAction | EditStaffAction;

export type ChatMessageBase = {
  id: string;
  roomId: string;
  sender: ChatUserRef;
  createdAt: number;
};

export type TextMessage = ChatMessageBase & {
  type: 'text';
  text: string;
};

export type ActionMessage = ChatMessageBase & {
  type: 'action';
  action: ChatAction;
};

export type ChatMessage = TextMessage | ActionMessage;

export type ChatMessageInput =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'action';
      action: ChatAction;
    };

export type JoinRoomPayload = {
  roomId: string;
  user: ChatUserRef;
};

export type SendMessagePayload = {
  roomId: string;
  message: ChatMessageInput;
};

export type ReceiveMessagePayload = {
  roomId: string;
  message: ChatMessage;
};

export type ActionEventRequestPayload = {
  roomId: string;
  action: ChatAction;
  correlationId: string;
};

export type ActionEventResultPayload = {
  roomId: string;
  action: ChatAction;
  correlationId: string;
  ok: boolean;
  error?: string;
  data?: unknown;
};

