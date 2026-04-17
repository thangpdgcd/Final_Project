import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";
import models from "../../models/index.js";
import { setUserAvatar, getUserAvatar } from "../../utils/userAvatar.js";

export const createStaffService = ({ staffRepository }) => {
  const { Users, Vouchers } = models;

  const getAllUsers = async () => {
    return staffRepository.listUsers();
  };

  const getUserById = async (id) => {
    const user = await staffRepository.findUserById(id);
    if (!user) throw new AppError(404, "User does not exist");
    return user;
  };

  const createUser = async (data) => {
    const { name, email, address, phoneNumber, password, roleID } = data;
    if (!name || !email || !password) {
      throw new AppError(400, "Missing required information");
    }

    const emailNorm = String(email).trim().toLowerCase();

    const finalRoleID =
      roleID !== undefined && roleID !== null && String(roleID).trim() !== ""
        ? String(roleID)
        : "2";
    const safeRoleID = ["1", "2", "3"].includes(finalRoleID) ? finalRoleID : "2";

    const existingEmail = await staffRepository.findUserByEmail(emailNorm);
    if (existingEmail) throw new AppError(400, "Email already exists.");

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
    if (!user) throw new AppError(404, "User does not exist");
    return user;
  };

  const deleteUser = async (id) => {
    const ok = await staffRepository.deleteUser(id);
    if (!ok) throw new AppError(404, "User does not exist");
    return null;
  };

  const createManualVoucher = async ({ voucherService, userId, type, value, staffId }) => {
    if (!voucherService) throw new AppError(500, "Voucher service not configured");
    if (!userId) throw new AppError(400, "userId is required");
    return voucherService.createManualVoucher({ userId, type, value, staffId });
  };

  const listVouchers = async ({ q, userId, page = 1, pageSize = 20 }) => {
    const limit = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

    const where = {};
    if (q) where.code = { [models.Sequelize.Op.like]: `%${String(q).trim()}%` };
    if (userId) where.userId = Number(userId);

    const { rows, count } = await Vouchers.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { items: rows, total: count, page: Math.max(Number(page) || 1, 1), pageSize: limit };
  };

  const updateVoucher = async ({ id, patch }) => {
    const voucher = await Vouchers.findByPk(Number(id));
    if (!voucher) throw new AppError(404, "Voucher not found");
    const allowed = ["expiresAt", "maxDiscountValue", "value", "type"];
    allowed.forEach((k) => {
      if (patch?.[k] !== undefined) voucher[k] = patch[k];
    });
    await voucher.save();
    return voucher;
  };

  const deleteVoucher = async ({ id }) => {
    const voucher = await Vouchers.findByPk(Number(id));
    if (!voucher) throw new AppError(404, "Voucher not found");
    await voucher.destroy();
    return null;
  };

  const getStaffProfile = async ({ staffId }) => {
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError(404, "User not found");
    const avatar = await getUserAvatar(id);
    return { ...user.toJSON(), avatar };
  };

  const updateStaffProfile = async ({ staffId, patch }) => {
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError(404, "User not found");
    ["name", "phoneNumber", "address"].forEach((k) => {
      if (patch?.[k] !== undefined) user[k] = patch[k];
    });
    await user.save();
    const avatar = await getUserAvatar(id);
    return { ...user.toJSON(), avatar };
  };

  const changeStaffPassword = async ({ staffId, currentPassword, newPassword }) => {
    if (!newPassword || String(newPassword).length < 6) throw new AppError(400, "Password must be at least 6 characters");
    const id = Number(staffId);
    const user = await Users.findByPk(id);
    if (!user) throw new AppError(404, "User not found");
    const ok = await bcrypt.compare(String(currentPassword ?? ""), String(user.password ?? ""));
    if (!ok) throw new AppError(400, "Current password is incorrect");
    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();
    return null;
  };

  const uploadStaffAvatar = async ({ staffId, avatarUrl }) => {
    const url = await setUserAvatar({ userId: staffId, avatarUrl });
    if (!url) throw new AppError(400, "Failed to set avatar");
    return { avatar: url };
  };

  const sendEmailToUser = async ({ staffId, toUserId, subject, content }) => {
    // Mock provider: log and return OK. Can be replaced with nodemailer later.
    if (!toUserId) throw new AppError(400, "toUserId is required");
    if (!subject || !content) throw new AppError(400, "subject and content are required");
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

