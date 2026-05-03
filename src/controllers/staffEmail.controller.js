import { sendError, sendSuccess } from "../utils/response.js";

export const createStaffEmailController = ({ staffEmailService }) => {
  const getMyStaffEmails = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      const { limit, offset } = req.query ?? {};
      const result = await staffEmailService.listForUser({ userId, limit, offset });
      return sendSuccess(res, 200, result, "OK");
    } catch (e) {
      const status = Number(e?.statusCode || e?.status) || 400;
      return sendError(res, status, e?.message || "Failed to get staff emails", null);
    }
  };

  const markRead = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?.userId;
      const id = req.params?.id;
      const updated = await staffEmailService.markRead({ userId, id });
      const plain = typeof updated.toJSON === "function" ? updated.toJSON() : updated;
      return sendSuccess(res, 200, plain, "OK");
    } catch (e) {
      const status = Number(e?.statusCode || e?.status) || 400;
      return sendError(res, status, e?.message || "Failed to mark as read", null);
    }
  };

  return { getMyStaffEmails, markRead };
};

