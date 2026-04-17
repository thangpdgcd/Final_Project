import { socketLogger } from "../../core/utils/socketLogger.js";

export const registerStaffInternalSocket = ({ io, socket, rooms }) => {
  socket.on("staff_internal_send", (payload = {}, ack) => {
    const role = String(socket.data.role ?? socket.data.user?.role ?? "").toLowerCase();
    if (role !== "staff" && role !== "admin") {
      if (typeof ack === "function") ack({ ok: false, message: "forbidden" });
      return;
    }

    const fromUserId = socket.data.userId ?? socket.data.user?.id;
    const message = payload?.message ?? payload;

    io.to(rooms.staff()).emit("staff_internal_receive", {
      from: { userId: fromUserId, role },
      message,
      ts: Date.now(),
    });

    socketLogger.info("staff_internal_send", "staff_internal_send dispatched", {
      socketId: socket.id,
      fromUserId,
    });
    if (typeof ack === "function") ack({ ok: true });
  });
};

