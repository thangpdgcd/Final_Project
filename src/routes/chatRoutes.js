import { buildChatRouter } from "../modules/chat/chat.routes.js";

const router = buildChatRouter();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat APIs
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: List conversations of current user
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message (auto-create conversation supported)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: integer
 *                 nullable: true
 *               recipientUserId:
 *                 type: integer
 *                 nullable: true
 *               type:
 *                 type: string
 *                 enum: [text, action]
 *               content:
 *                 type: string
 *               action:
 *                 type: string
 *               meta:
 *                 type: object
 *           examples:
 *             textMessage:
 *               summary: Send a text message
 *               value:
 *                 conversationId: 1
 *                 type: text
 *                 content: Hello
 *             actionMessage:
 *               summary: Send an action message
 *               value:
 *                 conversationId: 1
 *                 type: action
 *                 action: UPDATE_USER
 *                 meta:
 *                   targetUserId: 3
 *                   patch:
 *                     address: New address
 *     responses:
 *       201:
 *         description: Sent
 */

const initChatRoutes = (app) => {
  app.use("/api", router);
};

export default initChatRoutes;

