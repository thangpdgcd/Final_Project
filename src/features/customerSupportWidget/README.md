## Customer support widget

Messenger-like customer support chat widget (floating button + popup/drawer) using REST + Socket.IO.

### Backend

- Base URL: `http://localhost:8080`
- REST (Bearer JWT required)
  - `GET /api/conversations`
  - `GET /api/messages/:conversationId?limit=50&offset=0`
  - `POST /api/messages`
- Socket.IO
  - connect:
    - `io("http://localhost:8080", { path: "/socket.io/", auth: { token: accessToken }, withCredentials: true })`
  - emit:
    - `join_room {}` (customer auto-assign + join)
    - `join_room { conversationId: 123 }`
    - `send_message { conversationId?, message: { type: "text", content } }`
  - listen:
    - `receive_message`, `chat:message`, `error`

### Local run

```bash
npm install
npm run dev
```

Optional env:

- `VITE_API_URL=http://localhost:8080`
- `VITE_SOCKET_URL=http://localhost:8080`

### Behavior

- Customer-only: the widget assumes customer privileges (auto-assign allowed).
- On first open with no conversation, it emits `join_room {}` once per session.
- Optimistic sending: message appears immediately, then reconciles when the saved message arrives.
- Auto-scroll only if the user is near the bottom.
- Unread badge increments while the widget is closed.

### Quick test steps (2 browsers)

- **Browser A (customer)**
  - Login and visit any page under `CustomerLayout`
  - Click the floating button (bottom-right)
  - Send “Hello” and confirm optimistic bubble shows immediately
- **Browser B (staff)**
  - Login as staff and open `/support`
  - Reply in the same conversation
- **Back to Browser A**
  - Close the widget; verify unread badge increments on incoming messages
  - Re-open; unread clears and the new message is visible

