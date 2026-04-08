import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

let ioInstance = null;

export const getIO = () => ioInstance;

const toPayload = (order) => {
  if (!order) return null;
  return typeof order.toJSON === "function" ? order.toJSON() : order;
};

/** Notify `user:<userId>` and `staff` rooms of an order update. */
export const emitOrderUpdate = (order) => {
  const io = ioInstance;
  if (!io) return;
  const payload = toPayload(order);
  if (!payload) return;
  const uid = payload.userId ?? payload.user_ID;
  if (uid != null && uid !== "") {
    io.to(`user:${uid}`).to("staff").emit("order:update", payload);
  } else {
    io.to("staff").emit("order:update", payload);
  }
};

/** Notify customer and staff of a new order. */
export const emitOrderNew = (order) => {
  const io = ioInstance;
  if (!io) return;
  const payload = toPayload(order);
  if (!payload) return;
  const uid = payload.userId ?? payload.user_ID;
  if (uid != null && uid !== "") {
    io.to(`user:${uid}`).to("staff").emit("order:new", payload);
  } else {
    io.to("staff").emit("order:new", payload);
  }
};

/** Socket.IO on the same HTTP server; clients send `auth.token` (JWT). */
export const attachSocket = (httpServer) => {
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
    if (!token || !JWT_SECRET) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.data.userId = decoded.id;
      socket.data.roleID =
        decoded.roleID != null ? String(decoded.roleID) : "";
      return next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.data.userId;
    const rid = socket.data.roleID || "";

    if (uid != null && uid !== "") {
      socket.join(`user:${uid}`);
    }
    if (rid === "2" || rid === "3") {
      socket.join("staff");
    }

    console.log(
      "[socket] connected:",
      socket.id,
      "user:",
      uid,
      "staffRoom:",
      rid === "2" || rid === "3",
    );

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", socket.id, reason);
    });

    socket.on("chat:typing", (payload) => {
      socket.broadcast.emit("chat:typing", payload);
    });
  });

  return io;
};
