const toMessageBody = (payload) => {
  if (payload == null) return null;
  if (typeof payload === "string") return { type: "text", content: payload };
  if (typeof payload !== "object") return { type: "text", content: String(payload) };
  return payload.message ?? payload.data ?? payload;
};

export const createReceiveMessageEmitter = ({ io, logger }) => {
  return ({ fromUserId, fromRole, toRoom, toUserId, payload, socketId, socket }) => {
    const out = {
      from: { userId: fromUserId, role: fromRole },
      to: { room: toRoom, ...(toUserId ? { userId: toUserId } : {}) },
      message: toMessageBody(payload),
      ts: Date.now(),
    };

    logger?.info("receive_dispatch", "Dispatching receive_message", {
      socketId,
      fromUserId,
      fromRole,
      toRoom,
      toUserId,
    });

    io.to(toRoom).emit("receive_message", out);
    // Staff→user (and similar) only targeted the peer room; echo so the sender sees their own line.
    if (socket && typeof socket.emit === "function") {
      socket.emit("receive_message", out);
    }
    return out;
  };
};
