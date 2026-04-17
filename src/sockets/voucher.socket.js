import { socketLogger } from "../core/utils/socketLogger.js";
import { createVoucherService } from "../services/voucher.service.js";

export const registerVoucherSocket = ({ io, socket, rooms }) => {
  const voucherService = createVoucherService();

  socket.on("send_voucher", async (payload = {}) => {
    const staff = socket.data.user;
    const role = String(staff?.role ?? "").trim().toLowerCase();
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff) return;

    const userId = payload?.userId;
    const code = String(payload?.code ?? "").trim();
    const message = String(payload?.message ?? "").trim();
    if (!userId || !code) return;

    try {
      const voucher = await voucherService.findVoucherByCodeForUser({ code, userId });
      await voucherService.auditSendVoucher({
        voucherId: voucher?.id ?? null,
        staffId: staff?.id,
        userId,
        code,
        message,
      });
    } catch (e) {
      socketLogger.warn("voucher_audit_failed", "Voucher audit failed", {
        socketId: socket.id,
        message: e?.message || "Error",
      });
    }

    io.to(rooms.user(userId)).emit("send_voucher", {
      userId,
      code,
      message,
    });

    socketLogger.info("voucher_sent", "Voucher sent to user room", {
      socketId: socket.id,
      staffId: staff?.id,
      userId,
      code,
    });
  });
};

