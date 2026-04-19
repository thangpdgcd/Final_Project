import test from "node:test";
import assert from "node:assert/strict";
import { createChatController } from "./chat.controller.js";

const createRes = () => {
  const state = { code: 200, body: null };
  return {
    status: (code) => {
      state.code = code;
      return {
        json: (body) => {
          state.body = body;
          return body;
        },
      };
    },
    get state() {
      return state;
    },
  };
};

test("GET /conversations ignores userId query and uses token user context", async () => {
  let capturedArgs = null;
  const chatService = {
    listConversations: async (args) => {
      capturedArgs = args;
      return {
        items: [
          {
            conversationId: 1,
            participants: [{ userId: 101, roleAtJoin: "user" }],
            lastMessageAt: "2026-01-01T00:00:00.000Z",
            lastMessagePreview: "Hi",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false, nextOffset: null },
      };
    },
  };
  const controller = createChatController({ chatService });
  const req = {
    user: { id: 101, role: "customer" },
    query: { userId: "999", mine: "true" },
  };
  const res = createRes();

  await controller.listConversations(req, res);

  assert.equal(capturedArgs.user.id, 101);
  assert.equal(capturedArgs.user.role, "customer");
  assert.equal(capturedArgs.mineOnly, true);
  assert.equal(res.state.code, 200);
  assert.equal(Array.isArray(res.state.body.data), true);
});

test("GET /conversations/me always enforces mineOnly with default pagination", async () => {
  let capturedArgs = null;
  const chatService = {
    listConversations: async (args) => {
      capturedArgs = args;
      return {
        items: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false, nextOffset: null },
      };
    },
  };
  const controller = createChatController({ chatService });
  const req = { user: { id: 101, role: "customer" }, query: {} };
  const res = createRes();

  await controller.listMyConversations(req, res);

  assert.equal(capturedArgs.mineOnly, true);
  assert.equal(capturedArgs.limit, undefined);
  assert.equal(capturedArgs.offset, undefined);
  assert.equal(res.state.body.pagination.limit, 20);
});
