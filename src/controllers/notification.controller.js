import { sendError, sendSuccess } from "../utils/response.js";

export const createNotificationController = ({ notificationService }) => {
  const getMyNotifications = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      const { limit, offset, unreadOnly } = req.query ?? {};
      const result = await notificationService.listForUser({
        userId,
        limit,
        offset,
        unreadOnly: String(unreadOnly ?? "").trim().toLowerCase() === "true",
      });
      return sendSuccess(res, 200, result, "OK");
    } catch (e) {
      const status = Number(e?.statusCode || e?.status) || 400;
      return sendError(res, status, e?.message || "Failed to get notifications", null);
    }
  };

  const markRead = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      const id = req.params?.id;
      const updated = await notificationService.markRead({ userId, notificationId: id });
      const plain = typeof updated.toJSON === "function" ? updated.toJSON() : updated;
      return sendSuccess(res, 200, plain, "Marked as read");
    } catch (e) {
      const status = Number(e?.statusCode || e?.status) || 400;
      return sendError(res, status, e?.message || "Failed to mark as read", null);
    }
  };

  const markAllRead = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      const result = await notificationService.markAllRead({ userId });
      return sendSuccess(res, 200, result, "OK");
    } catch (e) {
      const status = Number(e?.statusCode || e?.status) || 400;
      return sendError(res, status, e?.message || "Failed to mark all as read", null);
    }
  };

  return { getMyNotifications, markRead, markAllRead };
};

