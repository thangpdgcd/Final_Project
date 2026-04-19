import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { socketLogger } from "../../utils/socketLogger.js";
import { joinDefaultRooms } from "../chat/rooms/room.manager.js";
import { rooms } from "./rooms.js";
import { events } from "./events.js";
import { presence } from "./presence.js";
import models from "../../models/index.js";

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
  const status = String(payload.status ?? "")
    .trim()
    .toLowerCase();
  const shouldEmitToStaff = status !== "cancelled";
  if (uid != null && uid !== "") {
    io.to(rooms.user(uid)).emit(events.order.update, payload);
    io.to(rooms.user(uid)).emit(events.order.updated, payload);
    if (shouldEmitToStaff) {
      io.to(rooms.staff()).emit(events.order.update, payload);
      io.to(rooms.staff()).emit(events.order.updated, payload);
    }
  } else {
    if (shouldEmitToStaff) {
      io.to(rooms.staff()).emit(events.order.update, payload);
      io.to(rooms.staff()).emit(events.order.updated, payload);
    }
  }
  if (payload.orderId != null && payload.orderId !== "") {
    io.to(rooms.order(payload.orderId)).emit(events.order.updated, payload);
  }
  if (status === "cancelled") {
    if (uid != null && uid !== "") io.to(rooms.user(uid)).emit(events.order.cancelled, payload);
  }
  if (status === "completed") {
    io.to(rooms.staff()).emit(events.order.completed, payload);
    if (uid != null && uid !== "") io.to(rooms.user(uid)).emit(events.order.completed, payload);
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
    io.to(rooms.staff()).emit(events.order.receive, payload);
  } else {
    io.to(rooms.staff()).emit(events.order.created, payload);
    io.to(rooms.staff()).emit(events.order.receive, payload);
  }
  if (payload.orderId != null && payload.orderId !== "") {
    io.to(rooms.order(payload.orderId)).emit(events.order.receive, payload);
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

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, secret);
      const userId = decoded?.id ?? decoded?.userId;
      let roleID =
        decoded?.roleID != null
          ? String(decoded.roleID)
          : decoded?.roleId != null
            ? String(decoded.roleId)
            : "";
      if (userId == null || userId === "") {
        return next(new Error("Authentication error"));
      }
      if (!roleID) {
        const user = await models.Users.findByPk(userId, {
          attributes: ["roleID"],
        });
        roleID = user?.roleID != null ? String(user.roleID) : "";
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
      const presencePayload = { userId: String(uid), role, online: true };
      // Customers: notify staff inbox only. Admin/staff: notify both so internal team chat sees peers.
      if (role === "user") {
        io.to(rooms.staff()).emit("presence:update", presencePayload);
      } else {
        io.to(rooms.staff()).emit("presence:update", presencePayload);
        io.to(rooms.admin()).emit("presence:update", presencePayload);
      }
    }

    socketLogger.info("connected", "Socket connected", {
      socketId: socket.id,
      userId: uid,
      role,
    });

    socket.on("disconnect", (reason) => {
      presence.onDisconnect({ userId: uid, socketId: socket.id });
      if (uid != null && uid !== "") {
        const presencePayload = { userId: String(uid), role, online: presence.isOnline(uid) };
        if (role === "user") {
          io.to(rooms.staff()).emit("presence:update", presencePayload);
        } else {
          io.to(rooms.staff()).emit("presence:update", presencePayload);
          io.to(rooms.admin()).emit("presence:update", presencePayload);
        }
      }
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

