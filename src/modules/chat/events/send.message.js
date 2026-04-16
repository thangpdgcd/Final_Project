const pickToUserId = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const raw =
    payload.toUserId ??
    payload.userId ??
    payload.recipientUserId ??
    payload.targetUserId;
  if (raw == null || raw === "") return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
};

const resolveTarget = ({ role, toUserId, roomManager }) => {
  if (role === "user") {
    return { toRoom: roomManager.staff(), flow: "user_to_staff" };
  }
  if (role === "staff") {
    if (!toUserId) return null;
    return { toRoom: roomManager.user(toUserId), toUserId, flow: "staff_to_user" };
  }
  if (role === "admin") {
    return { toRoom: roomManager.staff(), flow: "admin_to_staff" };
  }
  return null;
};

export const registerSendMessageHandler = ({
  socket,
  roomManager,
  emitReceiveMessage,
  logger,
}) => {
  socket.on("send_message", (payload, ack) => {
    const fromUserId = socket.data.userId ?? socket.data.user?.id;
    const fromRole = socket.data.role ?? socket.data.user?.role;
    const toUserId = pickToUserId(payload);

    const fail = (message, code = "BAD_REQUEST") => {
      logger?.warn("send_rejected", "Rejected send_message", {
        socketId: socket.id,
        fromUserId,
        fromRole,
        code,
        message,
      });
      if (typeof ack === "function") ack({ ok: false, code, message });
      socket.emit("error", { message });
    };

    if (!fromUserId || !fromRole) return fail("Unauthorized", "UNAUTHORIZED");

    const target = resolveTarget({ role: fromRole, toUserId, roomManager });
    if (!target && fromRole === "staff") {
      return fail("toUserId is required for staff messages", "MISSING_TO_USER");
    }
    if (!target) return fail("Invalid role", "INVALID_ROLE");

    logger?.info("send_accepted", "Accepted send_message", {
      socketId: socket.id,
      fromUserId,
      fromRole,
      flow: target.flow,
      toUserId: target.toUserId,
      toRoom: target.toRoom,
    });

    emitReceiveMessage({
      fromUserId,
      fromRole,
      toRoom: target.toRoom,
      toUserId: target.toUserId,
      payload,
      socketId: socket.id,
    });

    if (typeof ack === "function") ack({ ok: true });
  });
};
