import test from "node:test";
import assert from "node:assert/strict";
import { createChatService } from "./chat.service.js";

const makeConversation = ({ id, participants, text = "hello", action = null }) => ({
  id,
  type: "support",
  status: "open",
  createdByUserId: 1,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  participants,
  lastMessage: {
    id: 999 + id,
    text,
    action,
    createdAt: new Date("2026-01-03T00:00:00Z"),
  },
});

test("customer is always scoped to own conversations with safe pagination", async () => {
  let userCalls = 0;
  let globalCalls = 0;
  const chatRepository = {
    listConversationsForUser: async ({ userId, limit, offset }) => {
      userCalls += 1;
      assert.equal(userId, 101);
      assert.equal(limit, 50);
      assert.equal(offset, 0);
      return {
        total: 2,
        items: [
          makeConversation({ id: 1, participants: [{ userId: 101, roleAtJoin: "user" }] }),
          makeConversation({ id: 2, participants: [] }),
        ],
      };
    },
    listConversationsGlobal: async () => {
      globalCalls += 1;
      return { total: 0, items: [] };
    },
    isParticipant: async () => true,
    listMessages: async () => [],
  };
  const service = createChatService({ chatRepository, userRepository: null, staffRepository: null });

  const result = await service.listConversations({
    user: { id: 101, role: "customer" },
    mineOnly: false,
    limit: 999,
    offset: -20,
  });

  assert.equal(userCalls, 1);
  assert.equal(globalCalls, 0);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].conversationId, 1);
  assert.equal(result.items[0].lastMessagePreview, "hello");
  assert.deepEqual(result.pagination, {
    limit: 50,
    offset: 0,
    total: 2,
    hasMore: true,
    nextOffset: 50,
  });
});

test("admin can request global conversations without participant filter", async () => {
  let globalCalls = 0;
  const chatRepository = {
    listConversationsForUser: async () => {
      throw new Error("should not be called");
    },
    listConversationsGlobal: async ({ limit, offset }) => {
      globalCalls += 1;
      assert.equal(limit, 20);
      assert.equal(offset, 0);
      return {
        total: 1,
        items: [makeConversation({ id: 88, participants: [{ userId: 7, roleAtJoin: "staff" }] })],
      };
    },
    isParticipant: async () => true,
    listMessages: async () => [],
  };
  const service = createChatService({ chatRepository, userRepository: null, staffRepository: null });

  const result = await service.listConversations({
    user: { id: 2, role: "admin" },
    mineOnly: false,
  });

  assert.equal(globalCalls, 1);
  assert.equal(result.items[0].conversationId, 88);
  assert.equal(result.pagination.total, 1);
  assert.equal(result.pagination.hasMore, false);
});

test("customer cannot fetch messages of another conversation", async () => {
  const chatRepository = {
    isParticipant: async () => false,
    listMessages: async () => {
      throw new Error("must not list messages when unauthorized");
    },
    listConversationsForUser: async () => ({ items: [], total: 0 }),
    listConversationsGlobal: async () => ({ items: [], total: 0 }),
  };
  const service = createChatService({ chatRepository, userRepository: null, staffRepository: null });

  await assert.rejects(
    () =>
      service.getHistory({
        conversationId: 9999,
        user: { id: 101, role: "customer" },
        limit: 20,
        offset: 0,
      }),
    (err) => err?.statusCode === 403,
  );
});
