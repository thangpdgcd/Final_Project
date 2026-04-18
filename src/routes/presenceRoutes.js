import express from "express";
import models from "../models/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { presenceManager as presence } from "../modules/chat/rooms/presence.manager.js";
import { sendSuccess, sendError } from "../utils/response.js";

const MAX_BASIC_IDS = 100;
const STAFF_ADMIN_ROLE_IDS = new Set(["2", "3"]);

const getRoleId = (req) => String(req?.user?.roleID ?? "");
const isStaffOrAdmin = (req) => STAFF_ADMIN_ROLE_IDS.has(getRoleId(req));

const toStableUser = (raw) => {
  const row =
    raw && typeof raw.toJSON === "function"
      ? raw.toJSON()
      : raw && typeof raw.get === "function"
        ? raw.get({ plain: true })
        : raw ?? {};

  return {
    userId: row.userId ?? null,
    name: row.name ?? null,
    email: row.email ?? null,
    roleID: row.roleID ?? null,
  };
};

const parseBasicIds = (idsRaw) => {
  const raw = String(idsRaw ?? "").trim();
  if (!raw) return [];

  const parts = raw.split(",").map((x) => String(x).trim());
  if (parts.some((x) => !x)) {
    const err = new Error("ids must be a comma-separated list of positive integers");
    err.statusCode = 400;
    throw err;
  }

  const ids = [];
  const seen = new Set();
  for (const token of parts) {
    if (!/^\d+$/.test(token)) {
      const err = new Error("ids must contain positive integers only");
      err.statusCode = 400;
      throw err;
    }
    const id = Number(token);
    if (!Number.isSafeInteger(id) || id <= 0) {
      const err = new Error("ids must contain positive integers only");
      err.statusCode = 400;
      throw err;
    }
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  if (ids.length > MAX_BASIC_IDS) {
    const err = new Error(`ids cannot exceed ${MAX_BASIC_IDS} unique values`);
    err.statusCode = 400;
    throw err;
  }

  return ids;
};

export const createPresenceHandlers = ({
  modelsInstance = models,
  presenceInstance = presence,
} = {}) => {
  const usersModel = modelsInstance.Users;

  const getStaffOnline = async (req, res) => {
    try {
      const ids = presenceInstance.listOnlineUserIds();
      if (!ids.length) return sendSuccess(res, 200, [], "OK");

      const staff = await usersModel.findAll({
        where: { userId: ids, roleID: "3" },
        attributes: ["userId", "name", "email", "roleID"],
      });
      return sendSuccess(res, 200, staff.map(toStableUser), "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getUsersOnline = async (req, res) => {
    try {
      if (!isStaffOrAdmin(req)) {
        return sendError(res, 403, "Forbidden", null);
      }

      const ids = presenceInstance.listOnlineUserIds();
      if (!ids.length) return sendSuccess(res, 200, [], "OK");

      const users = await usersModel.findAll({
        where: { userId: ids },
        attributes: ["userId", "name", "email", "roleID"],
      });
      return sendSuccess(res, 200, users.map(toStableUser), "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getUsersBasic = async (req, res) => {
    try {
      if (!isStaffOrAdmin(req)) {
        return sendError(res, 403, "Forbidden", null);
      }

      const ids = parseBasicIds(req.query?.ids);
      if (!ids.length) return sendSuccess(res, 200, [], "OK");

      const users = await usersModel.findAll({
        where: { userId: ids },
        attributes: ["userId", "name", "email", "roleID"],
      });
      return sendSuccess(res, 200, users.map(toStableUser), "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  return {
    getStaffOnline,
    getUsersOnline,
    getUsersBasic,
  };
};

export const buildPresenceRouter = ({
  modelsInstance = models,
  presenceInstance = presence,
  authenticateMiddleware = authenticate,
} = {}) => {
  const router = express.Router();
  const handlers = createPresenceHandlers({ modelsInstance, presenceInstance });

/**
 * @swagger
 * /api/staff/online:
 *   get:
 *     summary: List online staff users (support queue)
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: OK
 */
  router.get("/staff/online", authenticateMiddleware, handlers.getStaffOnline);

/**
 * @swaggerhiện tại vẫn chưa connect tin nhắn với admin
 * /api/users/online:
 *   get:
 *     summary: List online users (all roles)
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: OK
 */
  router.get("/users/online", authenticateMiddleware, handlers.getUsersOnline);

/**
 * @swagger
 * /api/users/basic:
 *   get:
 *     summary: List basic user info by ids
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated user ids
 *     responses:
 *       200:
 *         description: OK
 */
  router.get("/users/basic", authenticateMiddleware, handlers.getUsersBasic);

  return router;
};

const initPresenceRoutes = (app) => {
  app.use("/api", buildPresenceRouter());
};

export default initPresenceRoutes;

