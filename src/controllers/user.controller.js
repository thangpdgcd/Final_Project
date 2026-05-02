import { sendSuccess, sendError } from "../utils/response.js";

export const createUserController = ({ userService }) => {
  const resolveAuthUserId = (req) => {
    const raw =
      req?.user?.id ??
      req?.user?.userId ??
      req?.user?._id ??
      req?.user?.user_ID;
    const normalized = Number(raw);
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  };

  const updateProfile = async (req, res) => {
    try {
      const { name, phoneNumber, address } = req.body;
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const result = await userService.updateProfile({
        userId,
        name,
        phoneNumber,
        address,
      });
      return sendSuccess(res, 200, result, "Profile updated successfully");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const changePassword = async (req, res) => {
    try {
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const { oldPassword, newPassword, confirmNewPassword } = req.body ?? {};
      const result = await userService.changePassword({
        userId,
        oldPassword,
        newPassword,
        confirmNewPassword,
      });
      return sendSuccess(res, 200, result, "Password updated successfully");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const uploadAvatar = async (req, res) => {
    try {
      if (!req.file) return sendError(res, 400, "No file uploaded", null);
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const avatarUrl = req.file.path;
      const result = await userService.setAvatar({ userId, avatarUrl });
      const message =
        result?.note || "Avatar uploaded successfully";
      return sendSuccess(res, 200, { avatarUrl: result.avatarUrl }, message);
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getWallet = async (req, res) => {
    try {
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const result = await userService.getWallet({ userId });
      return sendSuccess(res, 200, result, "Wallet loaded");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const topupWallet = async (req, res) => {
    try {
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const { amountXu, paypalCaptureId, note } = req.body ?? {};
      const result = await userService.topupWalletByPaypal({
        userId,
        amountXu,
        paypalCaptureId,
        note,
      });
      return sendSuccess(res, 200, result, "Wallet top-up successful");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getWalletTransactions = async (req, res) => {
    try {
      const userId = resolveAuthUserId(req);
      if (!userId) return sendError(res, 401, "Unauthorized", null);
      const result = await userService.getWalletTransactions({
        userId,
        limit: req.query?.limit,
      });
      return sendSuccess(res, 200, result, "Wallet transactions loaded");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  return {
    updateProfile,
    changePassword,
    uploadAvatar,
    getWallet,
    topupWallet,
    getWalletTransactions,
  };
};

