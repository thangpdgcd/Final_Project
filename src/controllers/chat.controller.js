import { sendSuccess, sendError } from "../utils/response.js";

export const createChatController = ({ chatService }) => {
  const parseMineFlag = (raw) => {
    if (raw == null) return true;
    const val = String(raw).trim().toLowerCase();
    if (val === "false" || val === "0" || val === "no") return false;
    return true;
  };

  const listConversations = async (req, res) => {
    try {
      const mineOnly = parseMineFlag(req.query.mine ?? req.query.mineOnly ?? "true");
      const result = await chatService.listConversations({
        user: req.user,
        limit: req.query.limit,
        offset: req.query.offset,
        mineOnly,
      });
      return res.status(200).json({
        success: true,
        message: "OK",
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const listMyConversations = async (req, res) => {
    try {
      const result = await chatService.listConversations({
        user: req.user,
        limit: req.query.limit,
        offset: req.query.offset,
        mineOnly: true,
      });
      return res.status(200).json({
        success: true,
        message: "OK",
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const createConversation = async (req, res) => {
    try {
      const convo = await chatService.createSupportConversation({ user: req.user });
      return sendSuccess(res, 201, convo, "Created");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getMessages = async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const messages = await chatService.getHistory({
        conversationId,
        user: req.user,
        limit,
        offset,
      });
      return sendSuccess(res, 200, messages, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const postMessage = async (req, res) => {
    try {
      const { conversationId, message } = await chatService.sendMessageFromApi({
        sender: req.user,
        body: req.body,
      });
      return sendSuccess(res, 201, { conversationId, message }, "Sent");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getConversation = async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const data = await chatService.getConversation({
        conversationId,
        user: req.user,
      });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const findOrCreateDirectConversation = async (req, res) => {
    try {
      const recipientUserId = req.body?.recipientUserId ?? req.body?.recipient_user_id;
      const data = await chatService.findOrCreateDirectConversation({
        user: req.user,
        recipientUserId,
      });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const claimConversation = async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const data = await chatService.claimConversation({
        conversationId,
        user: req.user,
      });
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  return {
    listConversations,
    listMyConversations,
    createConversation,
    getConversation,
    findOrCreateDirectConversation,
    claimConversation,
    getMessages,
    postMessage,
  };
};

