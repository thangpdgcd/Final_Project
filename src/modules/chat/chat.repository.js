import models from "../../models/index.js";

const { Conversations, ConversationParticipants, Messages } = models;

export const createChatRepository = () => {
  const clampLimit = (limit, defaultValue = 20, max = 50) => {
    const n = Number(limit);
    if (!Number.isFinite(n) || n <= 0) return defaultValue;
    return Math.min(Math.trunc(n), max);
  };

  const clampOffset = (offset, defaultValue = 0) => {
    const n = Number(offset);
    if (!Number.isFinite(n) || n < 0) return defaultValue;
    return Math.trunc(n);
  };

  const enrichConversations = async ({ conversations }) => {
    const ids = (conversations ?? []).map((c) => Number(c.id)).filter(Number.isFinite);
    if (ids.length === 0) return [];

    const participantsByConversationId = new Map();
    const participantRows = await ConversationParticipants.findAll({
      where: { conversationId: ids },
      attributes: ["conversationId", "userId", "roleAtJoin", "createdAt"],
      order: [["createdAt", "ASC"]],
      raw: true,
    });
    for (const row of participantRows) {
      const key = row.conversationId;
      const list = participantsByConversationId.get(key) ?? [];
      list.push(row);
      participantsByConversationId.set(key, list);
    }

    const lastMessageByConversationId = new Map();
    await Promise.all(
      ids.map(async (id) => {
        const last = await getLastMessage({ conversationId: id });
        lastMessageByConversationId.set(id, last);
      }),
    );

    return conversations.map((c) => ({
      ...c.toJSON(),
      participants: participantsByConversationId.get(c.id) ?? [],
      lastMessage: lastMessageByConversationId.get(c.id)
        ? lastMessageByConversationId.get(c.id).toJSON()
        : null,
    }));
  };

  const createConversation = async ({ createdByUserId, type = "support" }) => {
    return Conversations.create({ createdByUserId, type, status: "open" });
  };

  const addParticipant = async ({ conversationId, userId, roleAtJoin }) => {
    return ConversationParticipants.create({ conversationId, userId, roleAtJoin });
  };

  const addParticipantIfMissing = async ({ conversationId, userId, roleAtJoin }) => {
    const existing = await ConversationParticipants.findOne({
      where: { conversationId, userId },
      attributes: ["id"],
    });
    if (existing) return existing;
    return ConversationParticipants.create({ conversationId, userId, roleAtJoin });
  };

  const isParticipant = async ({ conversationId, userId }) => {
    const found = await ConversationParticipants.findOne({
      where: { conversationId, userId },
      attributes: ["id"],
    });
    return Boolean(found);
  };

  const getConversationById = async ({ conversationId }) => {
    return Conversations.findByPk(conversationId);
  };

  const listConversationIdsForUser = async ({ userId }) => {
    const rows = await ConversationParticipants.findAll({
      where: { userId },
      attributes: ["conversationId"],
      order: [["conversationId", "DESC"]],
      raw: true,
    });
    return rows.map((r) => r.conversationId);
  };

  const listParticipants = async ({ conversationId }) => {
    return ConversationParticipants.findAll({
      where: { conversationId },
      attributes: ["id", "conversationId", "userId", "roleAtJoin", "createdAt"],
      order: [["createdAt", "ASC"]],
    });
  };

  const findConversationIdByUserPair = async ({ userAId, userBId }) => {
    const a = Number(userAId);
    const b = Number(userBId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    const sequelize = Conversations.sequelize;
    // Find a conversation that contains BOTH participants.
    const [rows] = await sequelize.query(
      `
      SELECT cp.conversationId AS conversationId
      FROM conversation_participants cp
      WHERE cp.userId IN (:a, :b)
      GROUP BY cp.conversationId
      HAVING COUNT(DISTINCT cp.userId) = 2
      ORDER BY cp.conversationId DESC
      LIMIT 1
      `,
      { replacements: { a, b } },
    );
    const id = rows?.[0]?.conversationId;
    return id != null ? Number(id) : null;
  };

  const listOnlineStaffCandidates = async ({ ids }) => {
    const staffIds = (ids ?? []).map((x) => Number(x)).filter(Number.isFinite);
    if (staffIds.length === 0) return [];
    // Users model maps PK to attribute `userId` with field `user_ID`
    const users = await models.Users.findAll({
      where: { userId: staffIds, roleID: "3" },
      attributes: ["userId"],
      raw: true,
    });
    return users.map((u) => u.userId);
  };

  const countOpenConversationsForStaffIds = async ({ staffIds }) => {
    const ids = (staffIds ?? []).map((x) => Number(x)).filter(Number.isFinite);
    if (ids.length === 0) return new Map();

    const sequelize = Conversations.sequelize;
    const [rows] = await sequelize.query(
      `
      SELECT cp.userId AS staffId, COUNT(DISTINCT cp.conversationId) AS openCount
      FROM conversation_participants cp
      INNER JOIN conversations c ON c.id = cp.conversationId
      WHERE cp.userId IN (:ids)
        AND cp.roleAtJoin = 'staff'
        AND c.status = 'open'
      GROUP BY cp.userId
      `,
      { replacements: { ids } },
    );

    const map = new Map();
    for (const r of rows ?? []) {
      map.set(Number(r.staffId), Number(r.openCount) || 0);
    }
    for (const id of ids) {
      if (!map.has(id)) map.set(id, 0);
    }
    return map;
  };

  const createMessage = async ({
    conversationId,
    senderUserId,
    type,
    text,
    action,
    meta,
  }) => {
    return Messages.create({
      conversationId,
      senderUserId,
      type,
      text: text ?? null,
      action: action ?? null,
      meta: meta ?? null,
    });
  };

  const listMessages = async ({ conversationId, limit = 50, offset = 0 }) => {
    return Messages.findAll({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  };

  const getLastMessage = async ({ conversationId }) => {
    return Messages.findOne({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
    });
  };

  const listConversationsForUser = async ({ userId, limit = 20, offset = 0 }) => {
    const safeLimit = clampLimit(limit, 20, 50);
    const safeOffset = clampOffset(offset, 0);
    const sequelize = Conversations.sequelize;
    const [totalRows] = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM conversation_participants cp
      WHERE cp.userId = :userId
      `,
      { replacements: { userId } },
    );
    const total = Number(totalRows?.[0]?.total) || 0;
    if (total === 0) {
      return { items: [], total: 0, limit: safeLimit, offset: safeOffset };
    }

    const [idRows] = await sequelize.query(
      `
      SELECT c.id AS id
      FROM conversations c
      INNER JOIN conversation_participants cp ON cp.conversationId = c.id
      WHERE cp.userId = :userId
      ORDER BY c.updatedAt DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { userId, limit: safeLimit, offset: safeOffset },
      },
    );
    const ids = (idRows ?? []).map((r) => Number(r.id)).filter(Number.isFinite);
    if (ids.length === 0) {
      return { items: [], total, limit: safeLimit, offset: safeOffset };
    }

    const conversations = await Conversations.findAll({
      where: { id: ids },
      order: [["updatedAt", "DESC"]],
    });
    const items = await enrichConversations({ conversations });
    return { items, total, limit: safeLimit, offset: safeOffset };
  };

  const listConversationsGlobal = async ({ limit = 20, offset = 0 }) => {
    const safeLimit = clampLimit(limit, 20, 50);
    const safeOffset = clampOffset(offset, 0);

    const page = await Conversations.findAndCountAll({
      order: [["updatedAt", "DESC"]],
      limit: safeLimit,
      offset: safeOffset,
    });
    const items = await enrichConversations({ conversations: page.rows });
    return { items, total: Number(page.count) || 0, limit: safeLimit, offset: safeOffset };
  };

  return {
    createConversation,
    addParticipant,
    addParticipantIfMissing,
    isParticipant,
    getConversationById,
    listConversationIdsForUser,
    listParticipants,
    findConversationIdByUserPair,
    listOnlineStaffCandidates,
    countOpenConversationsForStaffIds,
    createMessage,
    listMessages,
    getLastMessage,
    listConversationsForUser,
    listConversationsGlobal,
  };
};

