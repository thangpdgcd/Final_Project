import test from "node:test";
import assert from "node:assert/strict";
import { createPresenceHandlers } from "./presenceRoutes.js";

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

const createHandlers = ({ findAll, onlineIds }) => {
  const modelsInstance = { Users: { findAll } };
  const presenceInstance = { listOnlineUserIds: () => onlineIds };
  return createPresenceHandlers({ modelsInstance, presenceInstance });
};

test("GET /users/basic returns 400 when ids are invalid", async () => {
  let queried = false;
  const handlers = createHandlers({
    findAll: async () => {
      queried = true;
      return [];
    },
    onlineIds: [],
  });
  const req = { user: { roleID: "3" }, query: { ids: "1,abc,3" } };
  const res = createRes();

  await handlers.getUsersBasic(req, res);

  assert.equal(res.state.code, 400);
  assert.equal(res.state.body.success, false);
  assert.equal(queried, false);
});

test("GET /users/basic returns mapped users for valid ids", async () => {
  let capturedWhere = null;
  const handlers = createHandlers({
    findAll: async (query) => {
      capturedWhere = query.where;
      return [
        { userId: 1, name: "Alice", email: "alice@example.com", roleID: "1" },
        { userId: 2, name: "Bob", email: "bob@example.com" },
      ];
    },
    onlineIds: [],
  });
  const req = { user: { roleID: "2" }, query: { ids: "1,2,2" } };
  const res = createRes();

  await handlers.getUsersBasic(req, res);

  assert.equal(res.state.code, 200);
  assert.deepEqual(capturedWhere, { userId: [1, 2] });
  assert.deepEqual(res.state.body.data, [
    { userId: 1, name: "Alice", email: "alice@example.com", roleID: "1" },
    { userId: 2, name: "Bob", email: "bob@example.com", roleID: null },
  ]);
});

test("GET /users/basic returns 403 for non staff/admin", async () => {
  const handlers = createHandlers({
    findAll: async () => [],
    onlineIds: [],
  });
  const req = { user: { roleID: "1" }, query: { ids: "1,2" } };
  const res = createRes();

  await handlers.getUsersBasic(req, res);

  assert.equal(res.state.code, 403);
  assert.equal(res.state.body.success, false);
  assert.equal(res.state.body.message, "Forbidden");
});

test("GET /users/online returns 403 for non staff/admin", async () => {
  const handlers = createHandlers({
    findAll: async () => [],
    onlineIds: [1, 2],
  });
  const req = { user: { roleID: "1" }, query: {} };
  const res = createRes();

  await handlers.getUsersOnline(req, res);

  assert.equal(res.state.code, 403);
  assert.equal(res.state.body.success, false);
  assert.equal(res.state.body.message, "Forbidden");
});

test("GET /users/online returns empty data when no one online", async () => {
  let queried = false;
  const handlers = createHandlers({
    findAll: async () => {
      queried = true;
      return [];
    },
    onlineIds: [],
  });
  const req = { user: { roleID: "3" }, query: {} };
  const res = createRes();

  await handlers.getUsersOnline(req, res);

  assert.equal(res.state.code, 200);
  assert.equal(res.state.body.success, true);
  assert.deepEqual(res.state.body.data, []);
  assert.equal(queried, false);
});
