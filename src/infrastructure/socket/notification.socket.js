import { socketLogger } from "../../utils/socketLogger.js";
import { createNotificationService } from "../../services/notification.service.js";

const toRole = (socket) => String(socket.data?.role ?? socket.data?.user?.role ?? "").trim().toLowerCase();
const toUserId = (socket) => socket.data?.userId ?? socket.data?.user?.id;

const normalizeType = (raw) => {
  const t = String(raw ?? "").trim().toLowerCase();
  if (t === "order" || t === "chat" || t === "system" || t === "voucher" || t === "email") return t;
  return "system";
};

export const registerNotificationSocket = ({ io, socket, rooms }) => {
  const notificationService = createNotificationService();

  socket.on("join_room", (payload = {}, ack) => {
    const reply = (data) => {
      if (typeof ack === "function") ack(data);
    };
    const requested = payload?.userId;
    const me = toUserId(socket);
    const role = toRole(socket);

    // Only allow joining your own private room (user:${id})
    if (!me || String(requested) !== String(me)) {
      return reply({ ok: false, message: "Forbidden" });
    }
    socket.join(rooms.user(me));
    return reply({ ok: true, room: rooms.user(me), role });
  });

  socket.on("send_notification", async (payload = {}, ack) => {
    const reply = (data) => {
      if (typeof ack === "function") ack(data);
    };

    const actorId = toUserId(socket);
    const actorRole = toRole(socket);
    const targetUserId = payload?.userId;
    const message = payload?.message;
    const type = normalizeType(payload?.type);

    // Role guard:
    // - admin/staff can send to any user
    // - user can only send to self (mainly for client-side testing)
    if (actorRole !== "admin" && actorRole !== "staff") {
      if (!actorId || String(targetUserId) !== String(actorId)) {
        return reply({ ok: false, message: "Forbidden" });
      }
    }

    try {
      const created = await notificationService.create({
        userId: targetUserId,
        message,
        type,
      });
      const plain = typeof created.toJSON === "function" ? created.toJSON() : created;
      io.to(rooms.user(targetUserId)).emit("receive_notification", plain);
      return reply({ ok: true, notification: plain });
    } catch (e) {
      socketLogger.warn("notification_send_failed", "send_notification failed", {
        socketId: socket.id,
        actorId,
        actorRole,
        error: e?.message || "Error",
      });
      return reply({
        ok: false,
        message: e?.message || "Failed to send notification",
        status: e?.statusCode ?? 500,
      });
    }
  });
};

