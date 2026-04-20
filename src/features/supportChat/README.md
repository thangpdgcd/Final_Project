## Support chat (Messenger-like)

This feature provides a real-time customer support chat UI (Messenger-like, dark) using REST + Socket.IO.

### Backend requirements

- **Base URL**: `http://localhost:8080`
- **REST**: Bearer JWT required (already handled by the app’s `httpClient`)
  - `GET /api/conversations`
  - `GET /api/messages/:conversationId?limit=50&offset=0`
  - `POST /api/messages`
- **Socket.IO**
  - connect:
    - `io("http://localhost:8080", { path: "/socket.io/", auth: { token: accessToken }, withCredentials: true })`
  - emit:
    - `join_room: { conversationId: number }` OR `{}` (customer auto-assign + join)
    - `send_message: { conversationId?, recipientUserId?, message: { type: "text"|"action", content?, action?, meta? } }`
  - listen:
    - `receive_message`, `chat:message`, `error`

### Role rules

- **Customer**
  - Can start a new support chat via auto-assign (`join_room {}`).
  - Can send the first message without IDs.
- **Staff/Admin**
  - Must select an existing `conversationId`.
  - The UI hides “Contact support”.
  - Optional: can join by `conversationId` using the input in the sidebar.

### Local run

1. Ensure backend is running on `http://localhost:8080`.
2. In this frontend:

```bash
npm install
npm run dev
```

Optional env overrides:

- `VITE_API_URL=http://localhost:8080` (REST base becomes `http://localhost:8080/api`)
- `VITE_SOCKET_URL=http://localhost:8080`

### Example payloads

Socket:

- Customer auto-assign:
  - `join_room {}`
  - `send_message { message: { type: "text", content: "Hi" } }`
- Existing conversation:
  - `join_room { conversationId: 123 }`
  - `send_message { conversationId: 123, message: { type: "text", content: "Hi" } }`

REST:

- `POST /api/messages` (customer auto-assign):

```json
{ "type": "text", "content": "Hi" }
```

- `POST /api/messages` (existing conversation):

```json
{ "conversationId": 123, "type": "text", "content": "Hi" }
```

### Quick manual test steps

- **Customer**
  - Login, open `/support`
  - Click “Contact support”
  - Send a message
  - Confirm it appears immediately (optimistic), then transitions to saved on receipt
- **Staff**
  - Login as staff/admin, open `/support`
  - Confirm there is no “Contact support”
  - Select a conversation and send a message
- **Scroll behavior**
  - Scroll up in a long thread; new incoming messages should not yank your scroll
  - Scroll near bottom; new incoming messages should auto-stick
