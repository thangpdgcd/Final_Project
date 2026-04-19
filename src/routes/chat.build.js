import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createChatRepository } from "../services/chat.repository.js";
import { createChatService } from "../services/chat.service.js";
import { createChatController } from "../controllers/chat.controller.js";
import { createUserRepository } from "../services/user.repository.js";
import { createStaffRepository } from "../services/staff.repository.js";

export const buildChatRouter = () => {
  const router = express.Router();

  const chatRepository = createChatRepository();
  const userRepository = createUserRepository();
  const staffRepository = createStaffRepository();
  const chatService = createChatService({ chatRepository, userRepository, staffRepository });
  const chatController = createChatController({ chatService });

  // Static paths must be registered before `/conversations/:conversationId` (avoid "me"/"direct" captured as id).
  router.get("/conversations/me", authenticate, chatController.listMyConversations);
  router.get("/conversations", authenticate, chatController.listConversations);
  router.post("/conversations/direct", authenticate, chatController.findOrCreateDirectConversation);
  router.get("/conversations/:conversationId", authenticate, chatController.getConversation);
  router.get("/messages/:conversationId", authenticate, chatController.getMessages);
  router.post("/messages", authenticate, chatController.postMessage);

  router.post("/chat/conversations", authenticate, chatController.createConversation);
  router.get(
    "/chat/conversations/:conversationId/messages",
    authenticate,
    chatController.getMessages,
  );
  /** Same as GET /conversations/:conversationId — under /chat for clients that only use the /chat/conversations prefix. */
  router.get("/chat/conversations/:conversationId", authenticate, chatController.getConversation);

  return router;
};

