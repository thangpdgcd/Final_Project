import models from "../models/index.js";
import { AppError } from "../utils/AppError.js";

const toInt = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export const createStaffEmailService = () => {
  const { StaffEmails } = models;

  const assertReady = () => {
    if (!StaffEmails) throw new AppError("StaffEmails model is not initialized", 500);
  };

  const listForUser = async ({ userId, limit = 50, offset = 0 } = {}) => {
    assertReady();
    const uid = toInt(userId);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);
    const safeLimit = Math.max(1, Math.min(200, toInt(limit) ?? 50));
    const safeOffset = Math.max(0, toInt(offset) ?? 0);

    const { rows, count } = await StaffEmails.findAndCountAll({
      where: { toUserId: uid },
      limit: safeLimit,
      offset: safeOffset,
      order: [["createdAt", "DESC"]],
    });
    return { items: rows, total: count, limit: safeLimit, offset: safeOffset };
  };

  const markRead = async ({ userId, id }) => {
    assertReady();
    const uid = toInt(userId);
    const eid = toInt(id);
    if (!uid || uid <= 0) throw new AppError("Invalid userId", 400);
    if (!eid || eid <= 0) throw new AppError("Invalid email id", 400);

    const row = await StaffEmails.findOne({ where: { id: eid, toUserId: uid } });
    if (!row) throw new AppError("Email not found", 404);
    if (!row.readAt) await row.update({ readAt: new Date() });
    return row;
  };

  return { listForUser, markRead };
};

