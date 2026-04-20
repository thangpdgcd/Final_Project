import models from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { createNotificationService } from "./notification.service.js";
import { emitNotificationsToUsers } from "../infrastructure/socket/notificationEmitter.js";

const { Vouchers, VoucherAuditLogs, Users } = models;
const notificationService = createNotificationService();

const toPositiveNumber = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const envNumber = (name, fallback) => {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const addHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

const generateCode = () => {
  // Chat-friendly code (no confusing chars)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
};

export const createVoucherService = () => {
  const createManualVoucher = async ({ userId, type, value, staffId }) => {
    const normalizedType = type === "fixed" || type === "percent" ? type : null;
    if (!normalizedType) throw new AppError("type must be fixed or percent", 400);

    const numericValue = toPositiveNumber(value);
    if (numericValue == null) throw new AppError("value must be a positive number", 400);
    if (normalizedType === "percent" && numericValue > 100) {
      throw new AppError("percent value must be <= 100", 400);
    }

    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) {
      throw new AppError("userId must be a positive integer", 400);
    }

    const sid = Number(staffId);
    if (!Number.isInteger(sid) || sid <= 0) {
      throw new AppError("Invalid staff account for voucher creation", 401);
    }

    const recipient = await Users.findByPk(uid);
    if (!recipient) {
      throw new AppError("No user exists with this userId", 404);
    }

    const ttlHours = envNumber("VOUCHER_TTL_HOURS", 24);
    const maxDiscountValue = envNumber("VOUCHER_MAX_DISCOUNT", 50000);

    if (normalizedType === "fixed" && numericValue > maxDiscountValue) {
      throw new AppError(`fixed value exceeds max discount (${maxDiscountValue})`, 400);
    }

    const expiresAt = addHours(ttlHours);

    try {
      return await models.sequelize.transaction(async (tx) => {
        let voucher = null;
        for (let i = 0; i < 6; i += 1) {
          try {
            voucher = await Vouchers.create(
              {
                code: generateCode(),
                userId: uid,
                type: normalizedType,
                value: numericValue,
                maxDiscountValue,
                expiresAt,
                createdByStaffId: sid,
              },
              { transaction: tx },
            );
            break;
          } catch (e) {
            const msg = String(e?.message ?? "");
            if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
              continue;
            }
            if (e?.name === "SequelizeForeignKeyConstraintError") {
              throw new AppError("Cannot create voucher: invalid user or staff reference", 400);
            }
            throw e;
          }
        }

        if (!voucher) throw new AppError("Failed to generate unique voucher code", 500);

        await VoucherAuditLogs.create(
          {
            voucherId: voucher.id,
            action: "create",
            staffId: sid,
            userId: uid,
            meta: { type: normalizedType, value: numericValue, expiresAt, maxDiscountValue },
          },
          { transaction: tx },
        );

        // Notify staff/admin that a voucher was created (per-user notifications, no broadcast)
        try {
          const staffAdmins = await Users.findAll({
            where: { roleID: { [models.Sequelize.Op.in]: ["2", "3"] } },
            attributes: ["userId"],
            raw: true,
          });
          const ids = staffAdmins.map((u) => u.userId);
          const rows = await notificationService.createForUsers({
            userIds: ids,
            type: "voucher",
            message: `Voucher created for user #${uid}`,
          });
          emitNotificationsToUsers({ userIds: ids, notifications: rows });
        } catch {}

        return voucher;
      });
    } catch (e) {
      if (e instanceof AppError) throw e;
      if (e?.name === "SequelizeForeignKeyConstraintError") {
        throw new AppError("Cannot create voucher: invalid user or staff reference", 400);
      }
      throw e;
    }
  };

  const auditSendVoucher = async ({ voucherId, staffId, userId, code, message }) => {
    await VoucherAuditLogs.create({
      voucherId: voucherId ?? null,
      action: "send",
      staffId: Number(staffId),
      userId: Number(userId),
      meta: { code, message: message ?? "" },
    });
  };

  const findVoucherByCodeForUser = async ({ code, userId }) => {
    return Vouchers.findOne({ where: { code: String(code), userId: Number(userId) } });
  };

  const attachVoucherToUserByCode = async ({ code, userId, staffId, message }) => {
    const normalizedCode = String(code ?? "").trim();
    if (!normalizedCode) throw new AppError("code is required", 400);

    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new AppError("Invalid userId", 400);

    const sid = Number(staffId);
    if (!Number.isInteger(sid) || sid <= 0) throw new AppError("Invalid staffId", 401);

    const now = new Date();
    const voucher = await Vouchers.findOne({ where: { code: normalizedCode } });
    if (!voucher) return null; // likely a promo code; caller can still audit/send message

    // If this voucher is already assigned to a different user, prevent leaking it.
    if (voucher.userId != null && Number(voucher.userId) !== uid) {
      throw new AppError("Voucher does not belong to this user", 403);
    }

    if (voucher.deletedAt) throw new AppError("Voucher is no longer available", 400);
    if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() <= now.getTime()) {
      throw new AppError("Voucher is expired", 400);
    }

    // Attach to user if not yet attached; ensure it's usable.
    const shouldUpdate =
      voucher.userId == null || String(voucher.status ?? "").toLowerCase() !== "active";

    if (shouldUpdate) {
      voucher.userId = uid;
      voucher.status = "active";
      await voucher.save();
    }

    await auditSendVoucher({
      voucherId: voucher.id,
      staffId: sid,
      userId: uid,
      code: normalizedCode,
      message,
    });

    return voucher;
  };

  const listActiveVouchersForUser = async ({ userId }) => {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new AppError("Invalid userId", 400);

    const now = new Date();
    const rows = await Vouchers.findAll({
      where: {
        userId: uid,
        status: "active",
        deletedAt: null,
        expiresAt: { [models.Sequelize.Op.gt]: now },
      },
      order: [["createdAt", "DESC"]],
    });

    return rows.map((v) => ({
      id: v.id,
      code: v.code,
      type: v.type,
      value: Number(v.value),
      maxDiscountValue: Number(v.maxDiscountValue),
      expiresAt: v.expiresAt,
      status: v.status,
      createdAt: v.createdAt,
      usedAt: v.usedAt ?? null,
      usedCount: v.usedCount ?? 0,
      maxUsage: v.maxUsage ?? 1,
    }));
  };

  return {
    createManualVoucher,
    auditSendVoucher,
    findVoucherByCodeForUser,
    attachVoucherToUserByCode,
    listActiveVouchersForUser,
  };
};

