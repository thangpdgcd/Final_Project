import test from "node:test";
import assert from "node:assert/strict";
import { registerChatSocket } from "./chat.socket.js";
import { AppError } from "../../utils/AppError.js";

const createSocketDouble = () => {
  const handlers = new Map();
  const emitted = [];
  const joined = [];
  return {
    data: { user: { id: 101, role: "customer" } },
    on: (event, handler) => handlers.set(event, handler),
    emit: (event, payload) => emitted.push({ event, payload }),
    join: (room) => joined.push(room),
    _handlers: handlers,
    _emitted: emitted,
    _joined: joined,
  };
};

const createIoDouble = () => {
  const outbound = [];
  return {
    to: (room) => ({
      emit: (event, payload) => {
        outbound.push({ room, event, payload });
      },
    }),
    _outbound: outbound,
  };
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("join_room denies access for non participant with clear ack", async () => {
  const socket = createSocketDouble();
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  const chatService = {
    getHistory: async () => {
      throw new AppError("You are not a participant of this conversation", 403);
    },
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const joinRoom = socket._handlers.get("join_room");
  assert.equal(typeof joinRoom, "function");

  let ackPayload = null;
  await joinRoom({ conversationId: 999 }, (payload) => {
    ackPayload = payload;
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(ackPayload, {
    ok: false,
    status: 403,
    error: "not a participant",
    message: "You are not a participant of this conversation",
  });
  assert.equal(socket._joined.length, 0);
});

test("send_message routes user -> staff through receive_message", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const sendMessage = socket._handlers.get("send_message");
  assert.equal(typeof sendMessage, "function");

  let ackPayload = null;
  sendMessage({ message: { content: "hello" } }, (payload) => {
    ackPayload = payload;
  });

  assert.deepEqual(ackPayload, { ok: true });
  assert.equal(io._outbound.length, 1);
  assert.equal(io._outbound[0].room, "staff");
  assert.equal(io._outbound[0].event, "receive_message");
});

test("send_message rejects staff without toUserId", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 301, role: "staff", user: { id: 301, role: "staff" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [301],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const sendMessage = socket._handlers.get("send_message");
  let ackPayload = null;
  sendMessage({ message: { content: "hello" } }, (payload) => {
    ackPayload = payload;
  });

  assert.deepEqual(ackPayload, {
    ok: false,
    code: "MISSING_TO_USER",
    message: "toUserId is required for staff messages",
  });
  assert.equal(io._outbound.length, 0);
  assert.equal(socket._emitted.at(-1).event, "error");
});

test("send_message routes admin -> staff through receive_message", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 2, role: "admin", user: { id: 2, role: "admin" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [2],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const sendMessage = socket._handlers.get("send_message");
  let ackPayload = null;
  sendMessage({ message: { content: "ping staff" } }, (payload) => {
    ackPayload = payload;
  });

  assert.deepEqual(ackPayload, { ok: true });
  assert.equal(io._outbound.length, 1);
  assert.equal(io._outbound[0].room, "staff");
  assert.equal(io._outbound[0].event, "receive_message");
});

test("send_message routes staff -> user through receive_message", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 3, role: "staff", user: { id: 3, role: "staff" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [3],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const sendMessage = socket._handlers.get("send_message");
  let ackPayload = null;
  sendMessage({ toUserId: 999, message: { content: "support reply" } }, (payload) => {
    ackPayload = payload;
  });

  assert.deepEqual(ackPayload, { ok: true });
  assert.equal(io._outbound.length, 1);
  assert.equal(io._outbound[0].room, "user:999");
  assert.equal(io._outbound[0].event, "receive_message");
});

test("chat:join emits chat:joined and does not echo chat:join", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = {
    chat: { join: "chat:join", joined: "chat:joined", message: "chat:message", typing: "chat:typing" },
  };
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const join = socket._handlers.get("chat:join");
  await join({ conversationId: 88 });
  await new Promise((resolve) => setTimeout(resolve, 0));

  const emittedEventNames = socket._emitted.map((x) => x.event);
  assert.equal(emittedEventNames.includes("chat:join"), false);
  assert.equal(emittedEventNames.includes("chat:joined"), true);
  assert.equal(emittedEventNames.includes("joined_room"), true);
});

test("join_room reuses cached auto-assigned conversation id on retries", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = { chat: { join: "chat:join", message: "chat:message", typing: "chat:typing" } };
  let autoAssignCalls = 0;
  const chatService = {
    getHistory: async () => [],
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => {
      autoAssignCalls += 1;
      return 77;
    },
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const joinRoom = socket._handlers.get("join_room");
  let ack1 = null;
  let ack2 = null;
  await joinRoom({}, (payload) => {
    ack1 = payload;
  });
  await sleep(500);
  await joinRoom({}, (payload) => {
    ack2 = payload;
  });
  await sleep(0);

  assert.equal(autoAssignCalls, 1);
  assert.deepEqual(ack1, { ok: true, conversationId: 77 });
  assert.equal(ack2?.ok, true);
  assert.equal(ack2?.conversationId, 77);
  assert.equal(ack2?.deduped, true);
});

test("join_room does not re-query history for already joined conversation", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = {
    chat: { join: "chat:join", joined: "chat:joined", message: "chat:message", typing: "chat:typing" },
  };
  let getHistoryCalls = 0;
  const chatService = {
    getHistory: async () => {
      getHistoryCalls += 1;
      return [];
    },
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const joinRoom = socket._handlers.get("join_room");
  let ack1 = null;
  let ack2 = null;
  await joinRoom({ conversationId: 55 }, (payload) => {
    ack1 = payload;
  });
  await sleep(1700);
  await joinRoom({ conversationId: 55 }, (payload) => {
    ack2 = payload;
  });
  await sleep(0);

  assert.equal(getHistoryCalls, 1);
  assert.deepEqual(ack1, { ok: true, conversationId: 55 });
  assert.deepEqual(ack2, { ok: true, conversationId: 55 });
  const joinedRoomEvents = socket._emitted.filter((x) => x.event === "joined_room");
  assert.equal(joinedRoomEvents.length, 2);
  assert.equal(joinedRoomEvents[1].payload.alreadyJoined, true);
});

test("join_room throttles burst requests to protect backend", async () => {
  const originalNow = Date.now;
  let tick = 0;
  Date.now = () => (tick++ === 0 ? 1000 : 1100);

  try {
    const socket = createSocketDouble();
    socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
    const io = createIoDouble();
    const rooms = {
      user: (id) => `user:${id}`,
      conversation: (id) => `conversation:${id}`,
      staff: () => "staff",
    };
    const events = {
      chat: { join: "chat:join", joined: "chat:joined", message: "chat:message", typing: "chat:typing" },
    };
    let getHistoryCalls = 0;
    const chatService = {
      getHistory: async () => {
        getHistoryCalls += 1;
        return [];
      },
      findOrCreateConversationWithUser: async () => 1,
      findOrCreateSupportConversationAutoAssign: async () => 1,
      sendMessage: async () => ({ id: 1 }),
      listParticipantUserIds: async () => [101],
    };

    registerChatSocket({ io, socket, rooms, events, chatService });

    const joinRoom = socket._handlers.get("join_room");
    let ack1 = null;
    let ack2 = null;
    await joinRoom({ conversationId: 55 }, (payload) => {
      ack1 = payload;
    });
    await joinRoom({ conversationId: 56 }, (payload) => {
      ack2 = payload;
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(ack1, { ok: true, conversationId: 55 });
    assert.equal(ack2?.ok, true);
    assert.equal(ack2?.throttled, true);
    assert.equal(getHistoryCalls, 1);
  } finally {
    Date.now = originalNow;
  }
});

test("join_room dedupes same payload inside dedupe window", async () => {
  const socket = createSocketDouble();
  socket.data = { userId: 101, role: "user", user: { id: 101, role: "user" } };
  const io = createIoDouble();
  const rooms = {
    user: (id) => `user:${id}`,
    conversation: (id) => `conversation:${id}`,
    staff: () => "staff",
  };
  const events = {
    chat: { join: "chat:join", joined: "chat:joined", message: "chat:message", typing: "chat:typing" },
  };
  let getHistoryCalls = 0;
  const chatService = {
    getHistory: async () => {
      getHistoryCalls += 1;
      return [];
    },
    findOrCreateConversationWithUser: async () => 1,
    findOrCreateSupportConversationAutoAssign: async () => 1,
    sendMessage: async () => ({ id: 1 }),
    listParticipantUserIds: async () => [101],
  };

  registerChatSocket({ io, socket, rooms, events, chatService });

  const joinRoom = socket._handlers.get("join_room");
  let ack1 = null;
  let ack2 = null;
  await joinRoom({ conversationId: 77 }, (payload) => {
    ack1 = payload;
  });
  await sleep(500);
  await joinRoom({ conversationId: 77 }, (payload) => {
    ack2 = payload;
  });
  await sleep(0);

  assert.deepEqual(ack1, { ok: true, conversationId: 77 });
  assert.equal(ack2?.ok, true);
  assert.equal(ack2?.conversationId, 77);
  assert.equal(ack2?.deduped, true);
  assert.equal(getHistoryCalls, 1);
});
