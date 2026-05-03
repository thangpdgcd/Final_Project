import { sendSuccess, sendError } from "../utils/response.js";

export const createStaffController = ({ staffService, voucherService, orderService }) => {
  const getAllUsers = async (req, res) => {
    try {
      const data = await staffService.getAllUsers();
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getUsersById = async (req, res) => {
    try {
      const id = req.params.id;
      const data = await staffService.getUserById(id);
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const createAdmin = async (req, res) => {
    try {
      const result = await staffService.createUser(req.body);
      return sendSuccess(res, 201, result, "Created");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const updateUsers = async (req, res) => {
    try {
      const id = req.params.id;
      const result = await staffService.updateUser(id, req.body);
      return sendSuccess(res, 200, result, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const deleteUsers = async (req, res) => {
    try {
      const id = req.params.id;
      await staffService.deleteUser(id);
      return sendSuccess(res, 200, null, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const createManualVoucher = async (req, res) => {
    try {
      const { userId, type, value } = req.body ?? {};
      const staffId = req.user?.id;
      const staffRole = req.user?.role ?? req.user?.roleID;
      if (!userId) return sendError(res, 400, "userId is required", null);

      const voucher = await staffService.createManualVoucher({
        voucherService,
        userId,
        type,
        value,
        staffId,
        staffRole,
      });

      return sendSuccess(
        res,
        201,
        {
          code: voucher.code,
          expiresAt: voucher.expiresAt,
          type: voucher.type,
          value: voucher.value,
          maxDiscountValue: voucher.maxDiscountValue,
        },
        "Created",
      );
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const listVouchers = async (req, res) => {
    try {
      const { q, userId, page, pageSize } = req.query ?? {};
      const data = await staffService.listVouchers({ q, userId, page, pageSize });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const updateVoucher = async (req, res) => {
    try {
      const id = req.params.id;
      const staffId = req.user?.id;
      const data = await staffService.updateVoucher({ id, patch: req.body, staffId });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const deleteVoucher = async (req, res) => {
    try {
      const id = req.params.id;
      await staffService.deleteVoucher({ id, staffId: req.user?.id });
      return sendSuccess(res, 200, null, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getProfile = async (req, res) => {
    try {
      const staffId = req.user?.id;
      const data = await staffService.getStaffProfile({ staffId });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const updateProfile = async (req, res) => {
    try {
      const staffId = req.user?.id;
      const data = await staffService.updateStaffProfile({ staffId, patch: req.body });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const changePassword = async (req, res) => {
    try {
      const staffId = req.user?.id;
      const { currentPassword, newPassword } = req.body ?? {};
      await staffService.changeStaffPassword({ staffId, currentPassword, newPassword });
      return sendSuccess(res, 200, null, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const uploadAvatar = async (req, res) => {
    try {
      const staffId = req.user?.id;
      const avatarUrl = req.file?.path ?? req.file?.secure_url ?? null;
      const data = await staffService.uploadStaffAvatar({ staffId, avatarUrl });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const sendEmail = async (req, res) => {
    try {
      const staffId = req.user?.id;
      const { toUserId, subject, content } = req.body ?? {};
      const data = await staffService.sendEmailToUser({ staffId, toUserId, subject, content });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getAnalytics = async (req, res) => {
    try {
      const { range } = req.query ?? {};
      const data = await orderService.getAnalytics({ range });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  /** Query: role=2 (admins) | role=3 (staff) — for internal messaging */
  const listTeamMembers = async (req, res) => {
    try {
      const role = req.query?.role ?? req.query?.roleID ?? "2";
      const data = await staffService.listUsersByRoleId(role);
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  return {
    getAllUsers,
    getUsersById,
    createAdmin,
    updateUsers,
    deleteUsers,
    createManualVoucher,
    listVouchers,
    updateVoucher,
    deleteVoucher,
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    sendEmail,
    getAnalytics,
    listTeamMembers,
  };
};

