import { AppError } from "../../utils/AppError.js";
import { socketLogger } from "../../utils/socketLogger.js";
import { createReceiveMessageEmitter } from "../chat/events/receive.message.js";
import { registerSendMessageAliases, registerSendMessageHandler } from "../chat/events/send.message.js";
import { roomManager } from "../chat/rooms/room.manager.js";

const defaultEvents = {
  chat: {
    join: "chat:join",
    joined: "chat:joined",
    message: "chat:message",
    typing: "chat:typing",
  },
};

const toPositiveInt = (raw, fallback) => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
};

const JOIN_ROOM_RATE_LIMIT_MS = toPositiveInt(
  process.env.SOCKET_JOIN_ROOM_RATE_LIMIT_MS,
  400,
);
const JOIN_ROOM_DEDUPE_WINDOW_MS = toPositiveInt(
  process.env.SOCKET_JOIN_ROOM_DEDUPE_WINDOW_MS,
  1500,
);
const MAX_JOIN_ROOM_KEYS_PER_SOCKET = 50;

export const registerChatSocket = ({
  io,
  socket,
  rooms = roomManager,
  events = defaultEvents,
  chatService,
  logger = socketLogger,
}) => {
  const joinedEventName = events?.chat?.joined || "chat:joined";
  const conversationRoom = (conversationId) => rooms.conversation(conversationId);
  const userRoom = (userId) => rooms.user(userId);
  const emitReceiveMessage = createReceiveMessageEmitter({ io, logger });
  const getJoinedConversationIds = () => {
    if (!(socket.data.joinedConversationIds instanceof Set)) {
      socket.data.joinedConversationIds = new Set();
    }
    return socket.data.joinedConversationIds;
  };
  const getJoinRoomState = () => {
    if (!socket.data.joinRoomState || typeof socket.data.joinRoomState !== "object") {
      socket.data.joinRoomState = {
        lastAttemptAt: 0,
        byKey: new Map(),
      };
    }
    if (!(socket.data.joinRoomState.byKey instanceof Map)) {
      socket.data.joinRoomState.byKey = new Map();
    }
    return socket.data.joinRoomState;
  };
  const buildJoinRoomKey = (payload) => {
    if (!payload || typeof payload !== "object") return "__empty__";
    const conversationId =
      payload.conversationId ??
      payload.conversation_ID ??
      payload.conversation ??
      payload.roomId ??
      payload.room_id ??
      null;
    const recipientUserId = payload.recipientUserId ?? payload.toUserId ?? null;
    return JSON.stringify({ conversationId, recipientUserId });
  };

  const emitToParticipants = async ({ conversationId, saved }) => {
    const ids = await chatService.listParticipantUserIds({
      conversationId,
      user: socket.data.user,
    });
    const plainMessage =
      saved && typeof saved.toJSON === "function"
        ? saved.toJSON()
        : saved && typeof saved.get === "function"
          ? saved.get({ plain: true })
          : saved;
    const payload = {
      conversationId,
      roomId: String(conversationId),
      message: plainMessage,
    };

    // Everyone who joined this conversation (join_room / chat:message) — reliable for admin↔staff threads.
    io.to(conversationRoom(conversationId)).emit("receive_message", payload);

    // Per-user rooms (socket joins user:${id} on connect) — backup + clients not in conv room yet.
    ids.forEach((uid) => {
      io.to(userRoom(uid)).emit("receive_message", payload);
    });

    logger.info("conversation_dispatch", "Dispatched conversation message", {
      socketId: socket.id,
      conversationId,
      participantCount: ids.length,
    });
  };

  const ensureConversationId = async ({ conversationId, recipientUserId }) => {
    if (conversationId != null && conversationId !== "") {
      const id = Number(conversationId);
      if (!Number.isFinite(id)) throw new AppError("Invalid conversationId", 400);
      return id;
    }
    if (recipientUserId != null && recipientUserId !== "") {
      const id = await chatService.findOrCreateConversationWithUser({
        createdByUser: socket.data.user,
        otherUserId: recipientUserId,
      });
      return Number(id);
    }
    // Support queue: customer can omit recipient and get auto-assigned staff.
    // Cache the first auto-assigned conversation on this socket to avoid
    // repeated create/find loops when frontend retries join events.
    const cachedId = Number(socket.data.autoSupportConversationId);
    if (Number.isFinite(cachedId) && cachedId > 0) {
      return cachedId;
    }
    const id = await chatService.findOrCreateSupportConversationAutoAssign({
      customerUser: socket.data.user,
    });
    const normalized = Number(id);
    if (Number.isFinite(normalized) && normalized > 0) {
      socket.data.autoSupportConversationId = normalized;
    }
    return normalized;
  };

  const pickConversationIdFromPayload = (payload) => {
    if (!payload || typeof payload !== "object") return undefined;
    const raw =
      payload.conversationId ??
      payload.conversation_ID ??
      payload.conversation ??
      payload.roomId ??
      payload.room_id;
    return raw;
  };

  const joinConversation = async ({ conversationId }) => {
    const id = Number(conversationId);
    if (!Number.isFinite(id)) throw new AppError("Invalid conversationId", 400);
    const joinedConversationIds = getJoinedConversationIds();
    if (joinedConversationIds.has(id)) {
      socket.emit(joinedEventName, { conversationId: id, alreadyJoined: true });
      socket.emit("joined_room", { conversationId: id, alreadyJoined: true });
      logger.info("join_room_skip", "Socket already joined conversation room", {
        socketId: socket.id,
        conversationId: id,
      });
      return;
    }
    await chatService.getHistory({
      conversationId: id,
      user: socket.data.user,
      limit: 1,
      offset: 0,
    });
    socket.join(rooms.conversation(id));
    joinedConversationIds.add(id);
    // Never echo the inbound join event name, it can trigger client-side loops.
    socket.emit(joinedEventName, { conversationId: id });
    // Legacy ack event (do NOT emit "join_room" or "chat:join" back).
    socket.emit("joined_room", { conversationId: id });
    logger.info("join_room", "Socket joined conversation room", {
      socketId: socket.id,
      conversationId: id,
    });
  };

  registerSendMessageHandler({
    socket,
    roomManager: rooms,
    emitReceiveMessage,
    logger,
  });

  registerSendMessageAliases({
    socket,
    roomManager: rooms,
    emitReceiveMessage,
    logger,
  });

  socket.on(events.chat.join, (payload) => {
    joinConversation(payload).catch((err) => {
      logger.warn("join_failed", "Failed to join room", {
        socketId: socket.id,
        error: err?.message || "Error",
      });
      socket.emit("error", { message: err?.message || "Error" });
    });
  });

  socket.on("join_room", (payload, ack) => {
    // This Socket.IO server also uses `join_room` for notifications (payload: { userId }).
    // Ignore those payloads here to avoid attempting to create/join a chat conversation.
    if (
      payload &&
      typeof payload === "object" &&
      "userId" in payload &&
      !("recipientUserId" in payload) &&
      !("conversationId" in payload) &&
      !("roomId" in payload)
    ) {
      return;
    }

    const maybeCreateAndJoin = async () => {
      const joinRoomState = getJoinRoomState();
      const now = Date.now();
      const keyForThrottle = buildJoinRoomKey(payload);
      if (now - joinRoomState.lastAttemptAt < JOIN_ROOM_RATE_LIMIT_MS) {
        const cached = joinRoomState.byKey.get(keyForThrottle);
        logger.warn("join_room_throttled", "join_room request throttled", {
          socketId: socket.id,
          rateLimitMs: JOIN_ROOM_RATE_LIMIT_MS,
        });
        if (typeof ack === "function") {
          ack({
            ok: true,
            throttled: true,
            conversationId: cached?.lastConversationId ?? null,
            message: "join_room throttled",
          });
        }
        return;
      }
      joinRoomState.lastAttemptAt = now;

      const key = buildJoinRoomKey(payload);
      const existing = joinRoomState.byKey.get(key);
      if (existing && now - existing.lastAt < JOIN_ROOM_DEDUPE_WINDOW_MS) {
        logger.info("join_room_deduped", "join_room duplicate payload skipped", {
          socketId: socket.id,
          dedupeWindowMs: JOIN_ROOM_DEDUPE_WINDOW_MS,
          conversationId: existing.lastConversationId,
        });
        if (typeof ack === "function") {
          ack({
            ok: true,
            conversationId: existing.lastConversationId ?? null,
            deduped: true,
          });
        }
        return;
      }

      const id = await ensureConversationId({
        conversationId: pickConversationIdFromPayload(payload),
        recipientUserId: payload?.recipientUserId,
      });

      joinRoomState.byKey.set(key, { lastAt: now, lastConversationId: id });
      if (joinRoomState.byKey.size > MAX_JOIN_ROOM_KEYS_PER_SOCKET) {
        const firstKey = joinRoomState.byKey.keys().next().value;
        if (firstKey !== undefined) joinRoomState.byKey.delete(firstKey);
      }

      await joinConversation({ conversationId: id });
      if (typeof ack === "function") {
        ack({ ok: true, conversationId: id });
      }
    };

    maybeCreateAndJoin().catch((err) => {
      const status = Number(err?.statusCode || err?.status) || 500;
      const message = err?.message || "Error";
      logger.warn("join_failed", "join_room rejected", {
        socketId: socket.id,
        status,
        message,
      });
      if (typeof ack === "function") {
        ack({
          ok: false,
          status,
          error: status === 403 ? "not a participant" : message,
          message,
        });
      }
      socket.emit("error", { message: err?.message || "Error" });
    });
  });

  // Legacy alias event -> normalize to receive_message (no double-emit).
  socket.on(events.chat.message, (payload, ack) => {
    const run = async () => {
      const conversationId = await ensureConversationId({
        conversationId: pickConversationIdFromPayload(payload),
        recipientUserId: payload?.recipientUserId,
      });

      socket.join(conversationRoom(conversationId));

      const saved = await chatService.sendMessage({
        conversationId,
        sender: socket.data.user,
        input: payload?.message ?? payload,
      });

      if (typeof ack === "function") {
        ack({ ok: true, conversationId, roomId: String(conversationId), message: saved });
      }

      await emitToParticipants({ conversationId, saved });
    };

    run().catch((err) => {
      const message = err?.message || "Error";
      logger.warn("conversation_send_failed", "chat:message failed", {
        socketId: socket.id,
        error: message,
      });
      if (typeof ack === "function") {
        ack({ ok: false, message });
      }
      socket.emit("error", { message });
    });
  });

  socket.on(events.chat.typing, (payload) => {
    const role = String(socket.data.role ?? socket.data.user?.role ?? "");
    const toUserId = payload?.toUserId ?? payload?.recipientUserId ?? payload?.userId ?? null;
    const conversationId = payload?.conversationId ?? payload?.roomId ?? null;

    if (conversationId != null && conversationId !== "") {
      socket.to(rooms.conversation(conversationId)).emit(events.chat.typing, payload);
      return;
    }

    if (role === "user") {
      socket.to(rooms.staff()).emit(events.chat.typing, payload);
      return;
    }
    if ((role === "staff" || role === "admin") && toUserId) {
      socket.to(rooms.user(toUserId)).emit(events.chat.typing, payload);
      return;
    }
  });

  socket.on("chat:seen", (payload = {}) => {
    const role = String(socket.data.role ?? socket.data.user?.role ?? "");
    const toUserId = payload?.toUserId ?? payload?.recipientUserId ?? payload?.userId ?? null;
    const conversationId = payload?.conversationId ?? payload?.roomId ?? null;

    if (conversationId != null && conversationId !== "") {
      socket.to(rooms.conversation(conversationId)).emit("chat:seen", payload);
      return;
    }

    if (role === "user") {
      socket.to(rooms.staff()).emit("chat:seen", payload);
      return;
    }
    if ((role === "staff" || role === "admin") && toUserId) {
      socket.to(rooms.user(toUserId)).emit("chat:seen", payload);
    }
  });
};

