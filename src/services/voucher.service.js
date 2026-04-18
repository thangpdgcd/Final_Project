import models from "../models/index.js";
import { AppError } from "../core/utils/AppError.js";

const { Vouchers, VoucherAuditLogs, Users } = models;

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

  return {
    createManualVoucher,
    auditSendVoucher,
    findVoucherByCodeForUser,
  };
};

