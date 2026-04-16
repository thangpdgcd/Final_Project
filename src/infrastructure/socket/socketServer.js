import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { socketLogger } from "../../core/utils/socketLogger.js";
import { joinDefaultRooms } from "../../modules/chat/rooms/room.manager.js";
import { rooms } from "./rooms.js";
import { events } from "./events.js";
import { presence } from "./presence.js";

let ioInstance = null;

export const getIO = () => ioInstance;

const toPayload = (modelOrPlain) => {
  if (!modelOrPlain) return null;
  return typeof modelOrPlain.toJSON === "function" ? modelOrPlain.toJSON() : modelOrPlain;
};

export const emitOrderUpdate = (order) => {
  const io = ioInstance;
  if (!io) return;
  const payload = toPayload(order);
  if (!payload) return;
  const uid = payload.userId ?? payload.user_ID;
  if (uid != null && uid !== "") {
    io.to(rooms.user(uid)).to(rooms.staff()).emit(events.order.update, payload);
  } else {
    io.to(rooms.staff()).emit(events.order.update, payload);
  }
};

export const emitOrderNew = (order) => {
  const io = ioInstance;
  if (!io) return;
  const payload = toPayload(order);
  if (!payload) return;
  const uid = payload.userId ?? payload.user_ID;
  if (uid != null && uid !== "") {
    io.to(rooms.user(uid)).to(rooms.staff()).emit(events.order.created, payload);
  } else {
    io.to(rooms.staff()).emit(events.order.created, payload);
  }
};

const roleIdToRole = (roleID) => {
  const id = roleID == null ? "" : String(roleID);
  if (id === "1") return "user";
  if (id === "2") return "admin";
  if (id === "3") return "staff";
  return null;
};

const normalizeRole = (role) => {
  if (!role) return null;
  const r = String(role).trim().toLowerCase();
  if (r === "customer") return "user";
  if (r === "user" || r === "admin" || r === "staff") return r;
  return null;
};

export const attachSocketServer = (httpServer, { registerModules } = {}) => {
  const io = new Server(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, secret);
      const userId = decoded?.id ?? decoded?.userId;
      const roleID =
        decoded?.roleID != null
          ? String(decoded.roleID)
          : decoded?.roleId != null
            ? String(decoded.roleId)
            : "";
      if (userId == null || userId === "") {
        return next(new Error("Authentication error"));
      }
      const role = normalizeRole(decoded.role) || roleIdToRole(roleID);
      const normalized = normalizeRole(role);
      socket.data.userId = userId;
      socket.data.role = normalized;
      socket.data.user = { id: userId, roleID, role: normalized };
      return next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.data.userId ?? socket.data.user?.id;
    const role = socket.data.role ?? socket.data.user?.role;

    joinDefaultRooms({ socket, userId: uid, role });

    if (uid != null && uid !== "") {
      presence.onConnect({ userId: uid, role, socketId: socket.id });
    }

    socketLogger.info("connected", "Socket connected", {
      socketId: socket.id,
      userId: uid,
      role,
    });

    socket.on("disconnect", (reason) => {
      presence.onDisconnect({ userId: uid, socketId: socket.id });
      socketLogger.info("disconnected", "Socket disconnected", {
        socketId: socket.id,
        userId: uid,
        reason,
      });
    });

    if (typeof registerModules === "function") {
      registerModules({ io, socket, rooms, events });
    }
  });

  return io;
};

