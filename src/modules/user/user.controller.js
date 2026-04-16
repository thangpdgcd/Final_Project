import { sendSuccess, sendError } from "../../utils/response.js";

export const createUserController = ({ userService }) => {
  const updateProfile = async (req, res) => {
    try {
      const { name, phoneNumber, address } = req.body;
      const userId = req.user.id;
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

  const uploadAvatar = async (req, res) => {
    try {
      if (!req.file) return sendError(res, 400, "No file uploaded", null);
      const userId = req.user.id;
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

  return { updateProfile, uploadAvatar };
};

