import { getIO } from "./socketServer.js";
import { roomManager as rooms } from "../chat/rooms/room.manager.js";

const toPlain = (row) => (row && typeof row.toJSON === "function" ? row.toJSON() : row);

export const emitNotificationToUser = ({ userId, notification }) => {
  const io = getIO();
  if (!io) return;
  if (userId == null || userId === "") return;
  io.to(rooms.user(userId)).emit("receive_notification", toPlain(notification));
};

export const emitNotificationsToUsers = ({ userIds, notifications }) => {
  const io = getIO();
  if (!io) return;
  const list = Array.isArray(userIds) ? userIds : [];
  const byIndex = Array.isArray(notifications) ? notifications : [];
  list.forEach((uid, idx) => {
    if (uid == null || uid === "") return;
    io.to(rooms.user(uid)).emit("receive_notification", toPlain(byIndex[idx] ?? null));
  });
};

