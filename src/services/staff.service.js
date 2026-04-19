import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError.js";
import models from "../models/index.js";
import { setUserAvatar, getUserAvatar } from "../utils/userAvatar.js";
import { createVoucherAdminService } from "./voucherAdmin.service.js";
import { promoVoucherService } from "./promoVoucher.service.js";

const voucherAdmin = createVoucherAdminService();

export const createStaffService = ({ staffRepository }) => {
  const { Users } = models;

  const getAllUsers = async () => {
    return staffRepository.listUsers();
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

  const createManualVoucher = async ({ voucherService, userId, type, value, staffId }) => {
    if (!voucherService) throw new AppError("Voucher service not configured", 500);
    if (!userId) throw new AppError("userId is required", 400);
    return voucherService.createManualVoucher({ userId, type, value, staffId });
  };

  const listVouchers = async (params = {}) => {
    const { q, userId, page = 1, pageSize = 20, status, dateFrom, dateTo, includeInactive } = params;
    const manual = await voucherAdmin.listVouchers({
      page,
      pageSize,
      search: q,
      userId,
      status: status ?? "all",
      dateFrom,
      dateTo,
      includeInactive,
    });

    // Merge in admin promo vouchers (promo_vouchers table).
    // Staff cannot create promo vouchers, but should be able to view + send codes to customers.
    const promo = await promoVoucherService.list({
      q,
      page,
      pageSize,
      // Align with "all" behavior by default.
      status: "all",
    });

    const promoMapped = (promo?.items ?? []).map((v) => ({
      id: `promo:${v.id}`,
      code: v.code,
      userId: v.applicableUsers === "specific" ? "specific" : v.applicableUsers ?? "all",
      type: v.discountType === "percentage" ? "percent" : v.discountType === "fixed" ? "fixed" : v.discountType,
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

    const manualItems = (manual?.items ?? []).map((v) => ({ ...v, source: v?.source ?? "manual" }));
    const merged = [...manualItems, ...promoMapped];

    return {
      items: merged,
      total: Number(manual?.total ?? 0) + Number(promo?.total ?? 0),
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

  const deleteVoucher = async ({ id }) => voucherAdmin.softDeleteVoucher({ id });

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
    // Mock provider: log and return OK. Can be replaced with nodemailer later.
    if (!toUserId) throw new AppError("toUserId is required", 400);
    if (!subject || !content) throw new AppError("subject and content are required", 400);
    return {
      ok: true,
      provider: "mock",
      fromStaffId: Number(staffId),
      toUserId: Number(toUserId),
      subject: String(subject),
    };
  };

  return {
    getAllUsers,
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

