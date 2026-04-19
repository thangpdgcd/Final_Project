import db from "../models/index.js";
import { AppError } from "../utils/AppError.js";

const { Notifications } = db;

const toInt = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const normalizeType = (raw) => {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (t === "order" || t === "chat" || t === "system" || t === "voucher") return t;
  return "system";
};

export const createNotificationService = () => {
  const assertReady = () => {
    if (!Notifications) {
      throw new AppError("Notifications model is not initialized", 500);
    }
  };

  const create = async ({ userId, message, type }) => {
    assertReady();
    const uid = toInt(userId);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);
    const msg = String(message ?? "").trim();
    if (!msg) throw new AppError("Missing message", 400);
    const row = await Notifications.create({
      userId: uid,
      message: msg,
      type: normalizeType(type),
      isRead: false,
    });
    return row;
  };

  const createForUsers = async ({ userIds, message, type }) => {
    assertReady();
    const msg = String(message ?? "").trim();
    if (!msg) throw new AppError("Missing message", 400);
    const ids = (userIds ?? [])
      .map((x) => toInt(x))
      .filter((x) => x && x > 0);
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return [];

    const rows = await Notifications.bulkCreate(
      uniqueIds.map((uid) => ({
        userId: uid,
        message: msg,
        type: normalizeType(type),
        isRead: false,
      })),
    );
    return rows;
  };

  const listForUser = async ({ userId, limit = 50, offset = 0, unreadOnly = false }) => {
    assertReady();
    const uid = toInt(userId);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);
    const safeLimit = Math.max(1, Math.min(200, toInt(limit) ?? 50));
    const safeOffset = Math.max(0, toInt(offset) ?? 0);
    const where = { userId: uid };
    if (unreadOnly) where.isRead = false;

    const { rows, count } = await Notifications.findAndCountAll({
      where,
      limit: safeLimit,
      offset: safeOffset,
      order: [["createdAt", "DESC"]],
    });
    return { items: rows, total: count, limit: safeLimit, offset: safeOffset };
  };

  const markRead = async ({ userId, notificationId }) => {
    assertReady();
    const uid = toInt(userId);
    const id = toInt(notificationId);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);
    if (!id || id <= 0) throw new AppError("Invalid notification id", 400);

    const row = await Notifications.findOne({ where: { id, userId: uid } });
    if (!row) throw new AppError("Notification not found", 404);
    if (!row.isRead) await row.update({ isRead: true });
    return row;
  };

  const markAllRead = async ({ userId }) => {
    assertReady();
    const uid = toInt(userId);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);

    const [updated] = await Notifications.update(
      { isRead: true },
      { where: { userId: uid, isRead: false } },
    );
    return { updated };
  };

  return { create, createForUsers, listForUser, markRead, markAllRead };
};

