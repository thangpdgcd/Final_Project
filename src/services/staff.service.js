import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError.js";
import models from "../models/index.js";
import { setUserAvatar, getUserAvatar } from "../utils/userAvatar.js";
import { createVoucherAdminService } from "./voucherAdmin.service.js";
import { promoVoucherService } from "./promoVoucher.service.js";
import { createNotificationService } from "./notification.service.js";
import { emitNotificationToUser } from "../infrastructure/socket/notificationEmitter.js";

const voucherAdmin = createVoucherAdminService();

export const createStaffService = ({ staffRepository }) => {
  const { Users, Orders, StaffEmails } = models;
  const notificationService = createNotificationService();

  const normalizeRole = (raw) => {
    const r = String(raw ?? "").trim().toLowerCase();
    if (!r) return null;
    if (r === "staff" || r === "3") return "staff";
    if (r === "admin" || r === "2") return "admin";
    if (r === "customer" || r === "user" || r === "1") return "customer";
    return null;
  };

  const envNumber = (name, fallback) => {
    const raw = process.env[name];
    if (raw == null || raw === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const isNewUser = async ({ userId }) => {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new AppError("userId must be a positive integer", 400);

    const user = await Users.findByPk(uid);
    if (!user) throw new AppError("No user exists with this userId", 404);

    // Condition 1: has no orders
    const ordersCount = await Orders.count({ where: { userId: uid } });
    if (ordersCount > 0) return { ok: false, reason: "has_orders" };

    // Condition 2: created recently (default: 7 days)
    const days = envNumber("NEW_USER_DAYS", 7);
    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    if (createdAt) {
      const ageDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
      if (ageDays > days) return { ok: false, reason: "too_old" };
    }

    return { ok: true };
  };

  const getAllUsers = async () => {
    return staffRepository.listUsers();
  };

  const getAllUsersLite = async ({ roleID, limit, onlyNew } = {}) => {
    const on = String(onlyNew ?? "").toLowerCase();
    const isOnlyNew = on === "true" || on === "1";
    if (!isOnlyNew) return staffRepository.listUsersLite({ roleID, limit });

    const days = envNumber("NEW_USER_DAYS", 7);
    const createdAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return staffRepository.listUsersLite({
      roleID,
      limit,
      createdAfter,
      excludeOrdered: true,
    });
  };

  /** List users by role for internal chat (e.g. admins roleID "2", staff "3"). */
  const listUsersByRoleId = async (roleID) => {
    const safe = String(roleID ?? "").trim();
    if (!["2", "3"].includes(safe)) {
      throw new AppError("role must be 2 (admin) or 3 (staff)", 400);
    }
    const rows = await staffRepository.listUsersByRoleId(safe);
    return rows.map((u) => {
      const j = u.toJSON ? u.toJSON() : u;
      return {
        userId: j.userId,
        name: j.name,
        email: j.email,
        roleID: j.roleID,
        phoneNumber: j.phoneNumber ?? null,
      };
    });
  };

  const getUserById = async (id) => {
    const user = await staffRepository.findUserById(id);
    if (!user) throw new AppError("User does not exist", 404);
    return user;
  };

  const createUser = async (data) => {
    const { name, email, address, phoneNumber, password, roleID } = data;
    if (!name || !email || !password) {
      throw new AppError("Missing required information", 400);
    }

    const emailNorm = String(email).trim().toLowerCase();

    const finalRoleID =
      roleID !== undefined && roleID !== null && String(roleID).trim() !== ""
        ? String(roleID)
        : "2";
    const safeRoleID = ["1", "2", "3"].includes(finalRoleID) ? finalRoleID : "2";

    const existingEmail = await staffRepository.findUserByEmail(emailNorm);
    if (existingEmail) throw new AppError("Email already exists.", 400);

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await staffRepository.createUser({
      name,
      email: emailNorm,
      address: address || "",
      phoneNumber: phoneNumber || "",
      password: passwordHash,
      roleID: safeRoleID,
      status: data.status || "active",
    });

    return newUser;
  };

  const updateUser = async (id, patch) => {
    const user = await staffRepository.updateUser(id, patch);
    if (!user) throw new AppError("User does not exist", 404);
    return user;
  };

  const deleteUser = async (id) => {
    const ok = await staffRepository.deleteUser(id);
    if (!ok) throw new AppError("User does not exist", 404);
    return null;
  };

  const createManualVoucher = async ({ voucherService, userId, type, value, staffId, staffRole }) => {
    if (!voucherService) throw new AppError("Voucher service not configured", 500);
    if (!userId) throw new AppError("userId is required", 400);
    const role = normalizeRole(staffRole);
    if (!role) throw new AppError("Unauthorized", 401);

    // Staff is limited: can create manual voucher ONLY for new users.
    if (role === "staff") {
      const verdict = await isNewUser({ userId });
      if (!verdict.ok) {
        throw new AppError("Staff can only create vouchers for new users", 403);
      }
    }

    // Admin can create for anyone.
    return voucherService.createManualVoucher({ userId, type, value, staffId });
  };

  const listVouchers = async (params = {}) => {
    const {
      q,
      userId,
      page = 1,
      pageSize = 20,
      status,
      dateFrom,
      dateTo,
      includeInactive,
      lite,
      includePromo,
    } = params;
    const manual = await voucherAdmin.listVouchers({
      page,
      pageSize,
      search: q,
      userId,
      status: status ?? "all",
      dateFrom,
      dateTo,
      includeInactive,
      lite,
    });

    // Normalize manual vouchers to staff frontend shape.
    const manualItems = (manual?.items ?? []).map((v) => ({
      id: v.id,
      code: v.code,
      userId: v.user_id ?? null,
      type: v.discount_type ?? null,
      value: v.discount_value ?? null,
      expiresAt: v.expired_at ?? null,
      status: v.record_status ?? v.display_status ?? "active",
      source: "manual",
      meta: v,
    }));

    const includePromoBool =
      String(includePromo ?? "true").toLowerCase() === "true" ||
      String(includePromo ?? "") === "1";

    let promoMapped = [];
    let promoTotal = 0;
    if (includePromoBool) {
      // Merge in admin promo vouchers (promo_vouchers table).
      // Staff cannot create promo vouchers, but should be able to view + send codes to customers.
      const promo = await promoVoucherService.list({
        q,
        page,
        pageSize,
        // Align with "all" behavior by default.
        status: "all",
      });
      promoTotal = Number(promo?.total ?? 0);
      promoMapped = (promo?.items ?? []).map((v) => ({
        id: `promo:${v.id}`,
        code: v.code,
        userId: v.applicableUsers === "specific" ? "specific" : v.applicableUsers ?? "all",
        type:
          v.discountType === "percentage"
            ? "percent"
            : v.discountType === "fixed"
              ? "fixed"
              : v.discountType,
        value: v.discountValue,
        expiresAt: v.endDate ?? null,
        status: v.isActive ? "active" : "inactive",
        source: "promo",
        meta: {
          applicableUsers: v.applicableUsers,
          specificUsers: v.specificUsers,
          startDate: v.startDate,
          endDate: v.endDate,
          expired: v.expired,
        },
      }));
    }

    const merged = [...manualItems, ...promoMapped];

    return {
      items: merged,
      total: Number(manual?.total ?? 0) + promoTotal,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  };

  const updateVoucher = async ({ id, patch, staffId }) => {
    return voucherAdmin.updateVoucher({
      id,
      staffId,
      patch: {
        discount_type: patch?.discount_type ?? patch?.type,
        discount_value: patch?.discount_value ?? patch?.value,
        max_usage: patch?.max_usage ?? patch?.maxUsage,
        expired_at: patch?.expired_at ?? patch?.expiresAt,
        record_status: patch?.record_status,
        code: patch?.code,
        user_id: patch?.user_id ?? patch?.userId,
      },
    });
  };

  const deleteVoucher = async ({ id, staffId }) => {
    void staffId;
    return voucherAdmin.softDeleteVoucher({ id });
  };

  const getStaffProfile = async ({ staffId }) => {
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError("User not found", 404);
    const avatar = await getUserAvatar(id);
    return { ...user.toJSON(), avatar };
  };

  const updateStaffProfile = async ({ staffId, patch }) => {
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError("User not found", 404);
    ["name", "phoneNumber", "address"].forEach((k) => {
      if (patch?.[k] !== undefined) user[k] = patch[k];
    });
    await user.save();
    const avatar = await getUserAvatar(id);
    return { ...user.toJSON(), avatar };
  };

  const changeStaffPassword = async ({ staffId, currentPassword, newPassword }) => {
    if (!newPassword || String(newPassword).length < 6)
      throw new AppError("Password must be at least 6 characters", 400);
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError("User not found", 404);
    const ok = await bcrypt.compare(String(currentPassword ?? ""), String(user.password ?? ""));
    if (!ok) throw new AppError("Current password is incorrect", 400);
    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();
    return null;
  };

  const uploadStaffAvatar = async ({ staffId, avatarUrl }) => {
    const url = await setUserAvatar({ userId: staffId, avatarUrl });
    if (!url) throw new AppError("Failed to set avatar", 400);
    return { avatar: url };
  };

  const sendEmailToUser = async ({ staffId, toUserId, subject, content }) => {
    if (!StaffEmails) throw new AppError("StaffEmails model is not initialized", 500);
    if (!toUserId) throw new AppError("toUserId is required", 400);
    if (!subject || !content) throw new AppError("subject and content are required", 400);

    const fromStaffId = Number(staffId);
    const uid = Number(toUserId);
    if (!Number.isFinite(fromStaffId) || fromStaffId <= 0) throw new AppError("Invalid staffId", 400);
    if (!Number.isFinite(uid) || uid <= 0) throw new AppError("Invalid toUserId", 400);

    const user = await Users.findByPk(uid);
    if (!user) throw new AppError("User not found", 404);
    const toEmail = String(user.email ?? "").trim();
    if (!toEmail) throw new AppError("User email not found", 400);

    const row = await StaffEmails.create({
      toUserId: uid,
      fromStaffId,
      toEmail,
      subject: String(subject).trim(),
      content: String(content).trim(),
      status: "sent",
    });

    // Create a notification (realtime + stored) for the user.
    try {
      const noti = await notificationService.create({
        userId: uid,
        type: "email",
        message: `Email from staff: ${String(subject).trim()}`,
      });
      emitNotificationToUser({ userId: uid, notification: noti });
    } catch {
      // Non-blocking: email record is the source of truth.
    }

    const plain = typeof row.toJSON === "function" ? row.toJSON() : row;
    return { ok: true, email: plain };
  };

  return {
    getAllUsers,
    getAllUsersLite,
    listUsersByRoleId,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createManualVoucher,
    listVouchers,
    updateVoucher,
    deleteVoucher,
    getStaffProfile,
    updateStaffProfile,
    changeStaffPassword,
    uploadStaffAvatar,
    sendEmailToUser,
  };
};

