import { socketLogger } from "../../core/utils/socketLogger.js";
import { AppError } from "../../utils/AppError.js";
import { orderService } from "./order.service.js";

const toActor = (socket) => ({
  id: socket.data?.userId ?? socket.data?.user?.id,
  role: socket.data?.role ?? socket.data?.user?.role,
});

const emitOrderChatReceive = ({ io, rooms, events, orderId, message }) => {
  io.to(rooms.order(orderId)).emit(events.order.chatReceive, {
    orderId: Number(orderId),
    message,
  });
};

export const registerOrderSocket = ({ io, socket, rooms, events }) => {
  const actor = toActor(socket);

  socket.on(events.order.send, async (payload, ack) => {
    try {
      const created = await orderService.createOrderFromCart({
        userId: actor.id,
        note: payload?.note,
      });
      if (typeof ack === "function") {
        ack({ ok: true, order: created });
      }
    } catch (err) {
      socketLogger.warn("order_send_failed", "send_order failed", {
        socketId: socket.id,
        userId: actor.id,
        error: err?.message || "Error",
      });
      if (typeof ack === "function") {
        ack({
          ok: false,
          message: err?.message || "Failed to create order",
          status: err?.statusCode ?? 500,
        });
      }
    }
  });

  socket.on(events.order.updateStatus, async (payload, ack) => {
    try {
      const updated = await orderService.updateOrderStatus({
        orderId: payload?.orderId,
        actor,
        status: payload?.status,
      });
      if (typeof ack === "function") {
        ack({ ok: true, order: updated });
      }
    } catch (err) {
      socketLogger.warn("order_status_failed", "update_order_status failed", {
        socketId: socket.id,
        userId: actor.id,
        error: err?.message || "Error",
      });
      if (typeof ack === "function") {
        ack({
          ok: false,
          message: err?.message || "Failed to update status",
          status: err?.statusCode ?? 500,
        });
      }
    }
  });

  socket.on(events.order.joinRoom, async (payload, ack) => {
    try {
      const orderId = Number(payload?.orderId);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        throw new AppError("Invalid orderId", 400);
      }

      await orderService.getOrderByIdForActor({ orderId, actor });
      socket.join(rooms.order(orderId));
      socket.emit("order:joined", { orderId });
      if (typeof ack === "function") ack({ ok: true, orderId });
    } catch (err) {
      if (typeof ack === "function") {
        ack({
          ok: false,
          message: err?.message || "Failed to join room",
          status: err?.statusCode ?? 500,
        });
      }
    }
  });

  socket.on(events.order.chatSend, async (payload, ack) => {
    try {
      const orderId = Number(payload?.orderId);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        throw new AppError("Invalid orderId", 400);
      }
      const saved = await orderService.createOrderMessage({
        orderId,
        actor,
        message: payload?.message,
      });
      socket.join(rooms.order(orderId));
      emitOrderChatReceive({
        io,
        rooms,
        events,
        orderId,
        message: saved,
      });
      if (typeof ack === "function") {
        ack({ ok: true, message: saved });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({
          ok: false,
          message: err?.message || "Failed to send order message",
          status: err?.statusCode ?? 500,
        });
      }
    }
  });
};

export default { registerOrderSocket };
