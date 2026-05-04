/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // Keep all seed logic inside this seeder (CJS) so the project
    // doesn't need a separate `src/scripts/` folder.
    const { default: models } = await import("../models/index.js");
    const { createChatRepository } = await import("../services/chat.repository.js");

    const { Users, Messages } = models;

    const getUserByEmail = async (email) => {
      if (!email) return null;
      return Users.findOne({
        where: { email: String(email).trim().toLowerCase() },
      });
    };

    const chatRepository = createChatRepository();
    const sequelize = models.sequelize;

    await sequelize.authenticate();

    const admin = await getUserByEmail("admin@example.com");
    const staff = await getUserByEmail("staff@example.com");
    const user = await getUserByEmail("user@example.com");

    if (!admin || !staff || !user) {
      console.warn(
        "[chat-seed] Missing seed users (admin@example.com / staff@example.com / user@example.com). Skipping chat seed.",
      );
      return;
    }

    const now = new Date();

    const getUserId = (u) => u?.userId ?? u?.user_ID ?? u?.id;

    const ensureConversation = async ({ userA, roleA, userB, roleB }) => {
      const userAId = getUserId(userA);
      const userBId = getUserId(userB);

      const existingId = await chatRepository.findConversationIdByUserPair({
        userAId,
        userBId,
      });
      if (existingId) return existingId;

      const convo = await chatRepository.createConversation({
        createdByUserId: userAId,
        type: "support",
      });

      await chatRepository.addParticipantIfMissing({
        conversationId: convo.id,
        userId: userAId,
        roleAtJoin: roleA,
      });
      await chatRepository.addParticipantIfMissing({
        conversationId: convo.id,
        userId: userBId,
        roleAtJoin: roleB,
      });

      return convo.id;
    };

    const ensureMessages = async ({ conversationId, items }) => {
      const existing = await Messages.findOne({
        where: { conversationId },
        attributes: ["id"],
      });
      if (existing) return;

      for (const item of items) {
        await Messages.create({
          conversationId,
          senderUserId: item.senderUserId,
          type: item.type,
          text: item.text ?? null,
          action: item.action ?? null,
          meta: item.meta ?? null,
          createdAt: item.createdAt ?? now,
          updatedAt: item.updatedAt ?? now,
        });
      }
    };

    const adminId = getUserId(admin);
    const staffId = getUserId(staff);
    const userId = getUserId(user);

    const adminStaffConversationId = await ensureConversation({
      userA: admin,
      roleA: "admin",
      userB: staff,
      roleB: "staff",
    });

    const adminUserConversationId = await ensureConversation({
      userA: admin,
      roleA: "admin",
      userB: user,
      roleB: "customer",
    });

    await ensureMessages({
      conversationId: adminStaffConversationId,
      items: [
        {
          senderUserId: adminId,
          type: "text",
          text: "Hi staff, please review the latest support tickets.",
        },
        {
          senderUserId: staffId,
          type: "text",
          text: "On it. I will update the user profile if needed.",
        },
        {
          senderUserId: adminId,
          type: "action",
          action: "UPDATE_STAFF",
          meta: { targetUserId: staffId, patch: { address: "Updated via chat seed" } },
        },
      ],
    });

    await ensureMessages({
      conversationId: adminUserConversationId,
      items: [
        {
          senderUserId: userId,
          type: "text",
          text: "Hello, I need help with my account details.",
        },
        {
          senderUserId: adminId,
          type: "text",
          text: "Sure — please confirm what you want to change.",
        },
        {
          senderUserId: adminId,
          type: "action",
          action: "UPDATE_USER",
          meta: { targetUserId: userId, patch: { address: "Updated via chat seed" } },
        },
      ],
    });

    console.log("[chat-seed] Seeded chat conversations/messages (idempotent).");
  },

  async down() {
    // No-op: seeded chat is idempotent and safe to keep.
  },
};

