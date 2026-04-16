import express from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { createChatRepository } from "./chat.repository.js";
import { createChatService } from "./chat.service.js";
import { createChatController } from "./chat.controller.js";
import { createUserRepository } from "../user/user.repository.js";
import { createStaffRepository } from "../staff/staff.repository.js";

export const buildChatRouter = () => {
  const router = express.Router();

  const chatRepository = createChatRepository();
  const userRepository = createUserRepository();
  const staffRepository = createStaffRepository();
  const chatService = createChatService({ chatRepository, userRepository, staffRepository });
  const chatController = createChatController({ chatService });

  // Required endpoints
  router.get("/conversations/me", authenticate, chatController.listMyConversations);
  router.get("/conversations", authenticate, chatController.listConversations);
  router.get("/messages/:conversationId", authenticate, chatController.getMessages);
  router.post("/messages", authenticate, chatController.postMessage);

  router.post("/chat/conversations", authenticate, chatController.createConversation);
  router.get(
    "/chat/conversations/:conversationId/messages",
    authenticate,
    chatController.getMessages,
  );

  return router;
};

