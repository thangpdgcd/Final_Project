import { socketLogger } from "../../utils/socketLogger.js";
import { createVoucherService } from "../../services/voucher.service.js";

export const registerVoucherSocket = ({ io, socket, rooms }) => {
  const voucherService = createVoucherService();

  socket.on("send_voucher", async (payload = {}, ack) => {
    const reply = (data) => {
      if (typeof ack === "function") ack(data);
    };

    const actor = socket.data.user;
    const role = String(actor?.role ?? "").trim().toLowerCase();
    const isStaffOrAdmin = role === "staff" || role === "admin";
    const isAdmin = role === "admin";
    if (!isStaffOrAdmin) return reply({ ok: false, message: "Forbidden" });

    const userId = payload?.userId;
    let code = String(payload?.code ?? "").trim();
    const message = String(payload?.message ?? "").trim();

    const wantsCreate =
      !code &&
      payload?.type != null &&
      payload?.value != null &&
      (payload.type === "fixed" || payload.type === "percent");

    // Staff cannot create vouchers via socket; only admin can.
    if (wantsCreate && !isAdmin) {
      return reply({ ok: false, message: "Only admin can create vouchers" });
    }

    if (wantsCreate) {
      try {
        const voucher = await voucherService.createManualVoucher({
          userId,
          type: payload.type,
          value: payload.value,
          staffId: actor?.id,
        });
        code = String(voucher?.code ?? "").trim();
      } catch (e) {
        const msg = e?.message || "Failed to create voucher";
        socketLogger.warn("voucher_create_failed", msg, {
          socketId: socket.id,
          staffId: actor?.id,
          userId,
        });
        return reply({ ok: false, message: msg });
      }
    }

    if (!userId || !code) {
      return reply({
        ok: false,
        message: "userId and code are required (or type + value to create)",
      });
    }

    try {
      // If this is a manual voucher code in DB, attach/activate it for the user so
      // `/api/vouchers/me` will show it. If it's a promo code, this returns null
      // and we still allow sending as a message.
      const attached = await voucherService.attachVoucherToUserByCode({
        code,
        userId,
        staffId: actor?.id,
        message,
      });

      if (!attached) {
        await voucherService.auditSendVoucher({
          voucherId: null,
          staffId: actor?.id,
          userId,
          code,
          message,
        });
      }
    } catch (e) {
      socketLogger.warn("voucher_audit_failed", "Voucher audit failed", {
        socketId: socket.id,
        message: e?.message || "Error",
      });
      return reply({ ok: false, message: e?.message || "Voucher send failed" });
    }

    io.to(rooms.user(userId)).emit("send_voucher", {
      userId,
      code,
      message,
    });

    socketLogger.info("voucher_sent", "Voucher sent to user room", {
      socketId: socket.id,
      staffId: actor?.id,
      userId,
      code,
    });

    return reply({ ok: true, code });
  });
};

