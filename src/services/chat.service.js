import { AppError } from "../utils/AppError.js";
import models from "../models/index.js";
import { presenceManager as presence } from "../infrastructure/chat/rooms/presence.manager.js";
import { createNotificationService } from "./notification.service.js";
import { emitNotificationsToUsers } from "../infrastructure/socket/notificationEmitter.js";

const serializeMessageForApi = (msg, fallbackSenderRoleId) => {
  if (!msg) return null;
  const row = typeof msg.toJSON === "function" ? msg.toJSON() : msg;
  const sender = row.sender;
  const senderRoleId =
    sender?.roleID != null
      ? String(sender.roleID)
      : fallbackSenderRoleId != null
        ? String(fallbackSenderRoleId)
        : undefined;
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderUserId: row.senderUserId,
    type: row.type,
    content: row.text ?? null,
    action: row.action ?? null,
    meta: row.meta ?? null,
    createdAt: row.createdAt,
    senderRoleId,
  };
};

const normalizeRole = (role) => {
  const r = role == null ? "" : String(role).trim().toLowerCase();
  if (!r) return null;
  if (r === "customer") return "user";
  if (r === "user" || r === "admin" || r === "staff") return r;
  return null;
};

const normalizeMessageType = (type) => {
  if (type == null) return null;
  const raw = String(type).trim();
  const t = raw.toLowerCase();
  if (t === "text") return "text";
  if (t === "action") return "action";
  // Legacy socket payloads: { type: "ACTION" }
  if (raw.toUpperCase() === "ACTION") return "action";
  return null;
};

const pickPatch = (patch, allowedKeys) => {
  if (!patch || typeof patch !== "object") return {};
  const out = {};
  for (const k of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(patch, k)) out[k] = patch[k];
  }
  return out;
};

export const createChatService = ({ chatRepository, userRepository, staffRepository }) => {
  const notificationService = createNotificationService();
  const normalizePagination = ({ limit, offset }) => {
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);
    const safeLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.trunc(parsedLimit), 50)
        : 20;
    const safeOffset =
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? Math.trunc(parsedOffset) : 0;
    return { limit: safeLimit, offset: safeOffset };
  };

  const toConversationPreview = (conversation) => {
    const participants = Array.isArray(conversation?.participants) ? conversation.participants : [];
    const lastMessage = conversation?.lastMessage ?? null;
    const previewText =
      lastMessage?.text ??
      (lastMessage?.action ? `[${String(lastMessage.action).trim()}]` : null);
    const lastMessageAt = lastMessage?.createdAt ?? conversation?.updatedAt ?? null;

    return {
      conversationId: conversation.id,
      id: conversation.id,
      type: conversation.type,
      status: conversation.status,
      createdByUserId: conversation.createdByUserId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participants,
      lastMessageAt,
      lastMessagePreview: previewText,
      lastMessage,
    };
  };

  const ensureParticipant = async ({ conversationId, user }) => {
    const ok = await chatRepository.isParticipant({
      conversationId,
      userId: user.id,
    });
    if (!ok) throw new AppError("You are not a participant of this conversation", 403);
  };

  const createSupportConversation = async ({ user }) => {
    const convo = await chatRepository.createConversation({
      createdByUserId: user.id,
      type: "support",
    });

    await chatRepository.addParticipant({
      conversationId: convo.id,
      userId: user.id,
      roleAtJoin: normalizeRole(user.role) || "user",
    });

    return convo;
  };

  const listConversations = async ({ user, limit, offset, mineOnly = true }) => {
    const role = normalizeRole(user?.role);
    if (!role) throw new AppError("Invalid user role", 401);
    const page = normalizePagination({ limit, offset });

    const forceMine = role === "user";
    const shouldUseMine = forceMine || Boolean(mineOnly);

    const result = shouldUseMine
      ? await chatRepository.listConversationsForUser({ userId: user.id, ...page })
      : await chatRepository.listConversationsGlobal(page);

    let items = (result.items ?? []).map(toConversationPreview);
    if (role === "user") {
      items = items.filter((x) => Array.isArray(x.participants) && x.participants.length > 0);
    }

    const total = Number(result.total) || 0;
    const hasMore = page.offset + items.length < total;
    return {
      items,
      pagination: {
        limit: page.limit,
        offset: page.offset,
        total,
        hasMore,
        nextOffset: hasMore ? page.offset + page.limit : null,
      },
    };
  };

  const findOrCreateConversationWithUser = async ({ createdByUser, otherUserId }) => {
    const meRole = normalizeRole(createdByUser?.role);
    if (!meRole) throw new AppError("Invalid user role", 401);

    const otherId = Number(otherUserId);
    if (!Number.isFinite(otherId)) throw new AppError("recipientUserId must be a number", 400);
    if (otherId === createdByUser.id) throw new AppError("recipientUserId must be different", 400);

    // Prevent customer↔customer private chats by default; require at least one staff/admin.
    const other = userRepository ? await userRepository.findById(otherId) : null;
    const otherRoleId = other?.roleID != null ? String(other.roleID) : null;
    const otherRole = otherRoleId === "2" ? "admin" : otherRoleId === "3" ? "staff" : otherRoleId === "1" ? "user" : null;
    if (!otherRole) throw new AppError("Recipient not found", 404);
    if (meRole === "user" && otherRole === "user") {
      throw new AppError("Users cannot start conversations with other users", 403);
    }

    const existingId = await chatRepository.findConversationIdByUserPair({
      userAId: createdByUser.id,
      userBId: otherId,
    });
    if (existingId) return existingId;

    const convo = await chatRepository.createConversation({
      createdByUserId: createdByUser.id,
      type: "support",
    });

    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: createdByUser.id,
      roleAtJoin: meRole,
    });
    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: otherId,
      roleAtJoin: otherRole,
    });

    return convo.id;
  };

  const pickLeastBusyOnlineStaffId = async () => {
    const onlineIds = presence.listOnlineUserIds();
    const staffIds = await chatRepository.listOnlineStaffCandidates({ ids: onlineIds });
    if (staffIds.length === 0) return null;

    const loadByStaffId = await chatRepository.countOpenConversationsForStaffIds({
      staffIds,
    });
    let best = staffIds[0];
    let bestLoad = loadByStaffId.get(best) ?? 0;
    for (const id of staffIds) {
      const load = loadByStaffId.get(id) ?? 0;
      if (load < bestLoad) {
        best = id;
        bestLoad = load;
      }
    }
    return best;
  };

  const findOrCreateSupportConversationAutoAssign = async ({ customerUser }) => {
    const role = normalizeRole(customerUser?.role);
    if (role !== "user") {
      throw new AppError("Auto-assign is only supported for users", 403);
    }
    if (!userRepository) throw new AppError("Server is missing user repository", 500);

    const staffId = await pickLeastBusyOnlineStaffId();
    if (!staffId) {
      throw new AppError("No staff online right now", 503);
    }

    const existingId = await chatRepository.findConversationIdByUserPair({
      userAId: customerUser.id,
      userBId: staffId,
    });
    if (existingId) return existingId;

    const convo = await chatRepository.createConversation({
      createdByUserId: customerUser.id,
      type: "support",
    });

    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: customerUser.id,
      roleAtJoin: "user",
    });
    await chatRepository.addParticipantIfMissing({
      conversationId: convo.id,
      userId: staffId,
      roleAtJoin: "staff",
    });

    return convo.id;
  };

  const applyActionSideEffects = async ({ sender, action, meta }) => {
    const senderRole = normalizeRole(sender?.role);
    if (!senderRole) throw new AppError("Invalid user role", 401);

    const upper = String(action ?? "").trim().toUpperCase();
    if (!upper) throw new AppError("Action is required", 400);

    const targetUserId = Number(meta?.targetUserId);
    if (!Number.isFinite(targetUserId)) {
      throw new AppError("meta.targetUserId must be a number", 400);
    }
    const allowedPatch = pickPatch(meta?.patch, ["name", "address", "phoneNumber"]);
    if (Object.keys(allowedPatch).length === 0) {
      throw new AppError("meta.patch must include at least one allowed field", 400);
    }

    if (!userRepository || !staffRepository) {
      throw new AppError("Server is missing user/staff repositories", 500);
    }

    const target = await userRepository.findById(targetUserId);
    if (!target) throw new AppError("Target user not found", 404);
    const targetRoleId = target.roleID != null ? String(target.roleID) : null;

    if (upper === "UPDATE_USER") {
      if (!(senderRole === "admin" || senderRole === "staff")) {
        throw new AppError("Only admin/staff can UPDATE_USER", 403);
      }
      if (targetRoleId !== "1") throw new AppError("Target must be a customer", 400);
      return userRepository.updateById(targetUserId, allowedPatch);
    }

    if (upper === "UPDATE_STAFF") {
      if (senderRole !== "admin") throw new AppError("Only admin can UPDATE_STAFF", 403);
      if (targetRoleId !== "3") throw new AppError("Target must be staff", 400);
      return staffRepository.updateUser(targetUserId, allowedPatch);
    }

    throw new AppError(`Unsupported action: ${upper}`, 400);
  };

  const sendMessage = async ({ conversationId, sender, input }) => {
    await ensureParticipant({ conversationId, user: sender });

    const type = normalizeMessageType(input?.type) ?? "text";
    const text =
      type === "text"
        ? String(input?.content ?? input?.text ?? "").trim()
        : null;
    const action = type === "action" ? String(input?.action ?? "").trim() : null;
    const meta = type === "action" ? (input?.meta ?? input?.payload ?? null) : null;

    if (type === "text" && !text) {
      throw new AppError("Message content is required", 400);
    }
    if (type === "action" && !action) {
      throw new AppError("Action is required", 400);
    }

    const msg = await chatRepository.createMessage({
      conversationId,
      senderUserId: sender.id,
      type,
      text,
      action,
      meta,
    });

    if (type === "action") {
      await applyActionSideEffects({ sender, action, meta });
    }

    const reloaded = await models.Messages.findByPk(msg.id, {
      include: [
        {
          model: models.Users,
          as: "sender",
          attributes: ["userId", "roleID", "name"],
          required: false,
        },
      ],
    });
    return serializeMessageForApi(reloaded ?? msg, sender?.roleID);
  };

  const sendMessageFromApi = async ({ sender, body }) => {
    const senderRole = normalizeRole(sender?.role);
    if (!senderRole) throw new AppError("Invalid user role", 401);

    const recipientUserId = body?.recipientUserId;
    let conversationId =
      body?.conversationId != null && body?.conversationId !== ""
        ? Number(body.conversationId)
        : null;

    if (!conversationId) {
      if (recipientUserId != null && recipientUserId !== "") {
        conversationId = await findOrCreateConversationWithUser({
          createdByUser: sender,
          otherUserId: recipientUserId,
        });
      } else if (senderRole === "user") {
        conversationId = await findOrCreateSupportConversationAutoAssign({
          customerUser: sender,
        });
      } else {
        throw new AppError("conversationId or recipientUserId is required", 400);
      }
    }

    if (!Number.isFinite(Number(conversationId))) {
      throw new AppError("conversationId must be a number", 400);
    }

    const messageInput = {
      type: body?.type ?? "text",
      content: body?.content ?? body?.text,
      action: body?.action,
      meta: body?.meta ?? body?.payload,
    };

    const saved = await sendMessage({
      conversationId: Number(conversationId),
      sender,
      input: messageInput,
    });

    // Notify other participants (excluding sender) about new message
    try {
      const participants = await chatRepository.listParticipants({
        conversationId: Number(conversationId),
      });
      const ids = (participants ?? [])
        .map((p) => p?.userId)
        .filter((id) => id != null && String(id) !== String(sender?.id));

      const rows = await notificationService.createForUsers({
        userIds: ids,
        type: "chat",
        message: "You have a new chat message",
      });
      emitNotificationsToUsers({ userIds: ids, notifications: rows });
    } catch {}

    return { conversationId: Number(conversationId), message: saved };
  };

  const getHistory = async ({ conversationId, user, limit, offset }) => {
    await ensureParticipant({ conversationId, user });
    const messages = await chatRepository.listMessages({ conversationId, limit, offset });
    return messages.map((m) => serializeMessageForApi(m));
  };

  const listParticipantUserIds = async ({ conversationId, user }) => {
    await ensureParticipant({ conversationId, user });
    const rows = await chatRepository.listParticipants({ conversationId });
    return (rows ?? [])
      .map((p) => Number(p?.userId))
      .filter((id) => Number.isFinite(id) && id > 0);
  };

  const getConversation = async ({ conversationId, user }) => {
    const id = Number(conversationId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new AppError("Invalid conversationId", 400);
    }
    await ensureParticipant({ conversationId: id, user });
    const row = await chatRepository.getConversationEnrichedById({ conversationId: id });
    if (!row) throw new AppError("Conversation not found", 404);
    return toConversationPreview(row);
  };

  /** REST: tìm hoặc tạo DM admin↔staff / staff↔admin / user↔staff… (cùng rule findOrCreateConversationWithUser). */
  const findOrCreateDirectConversation = async ({ user, recipientUserId }) => {
    const convId = await findOrCreateConversationWithUser({
      createdByUser: user,
      otherUserId: recipientUserId,
    });
    const row = await chatRepository.getConversationEnrichedById({ conversationId: convId });
    if (!row) throw new AppError("Conversation not found", 404);
    return toConversationPreview(row);
  };

  return {
    createSupportConversation,
    listConversations,
    getConversation,
    findOrCreateDirectConversation,
    findOrCreateConversationWithUser,
    findOrCreateSupportConversationAutoAssign,
    sendMessage,
    sendMessageFromApi,
    getHistory,
    listParticipantUserIds,
  };
};

