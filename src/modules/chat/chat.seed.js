import models from "../../models/index.js";
import { createChatRepository } from "./chat.repository.js";

const { Users, Messages } = models;

const asBool = (v) => {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
};

const getUserByEmail = async (email) => {
  if (!email) return null;
  return Users.findOne({ where: { email: String(email).trim().toLowerCase() } });
};

export const seedChatOnStartup = async () => {
  if (!asBool(process.env.SEED_ON_STARTUP)) return;

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

  const ensureConversation = async ({ userA, roleA, userB, roleB }) => {
    const existingId = await chatRepository.findConversationIdByUserPair({
      userAId: userA.userId ?? userA.user_ID ?? userA.id,
      userBId: userB.userId ?? userB.user_ID ?? userB.id,
    });
    if (existingId) return existingId;

    const convo = await chatRepository.createConversation({
      createdByUserId: userA.userId ?? userA.user_ID ?? userA.id,
      type: "support",
    });

    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: userA.userId ?? userA.user_ID ?? userA.id,
      roleAtJoin: roleA,
    });
    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: userB.userId ?? userB.user_ID ?? userB.id,
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

  const adminId = admin.userId;
  const staffId = staff.userId;
  const userId = user.userId;

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
};

