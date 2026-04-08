import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { sendError } from "../utils/response.js";

const { Users } = models;

const BEARER = /^Bearer\s+(\S+)$/i;

const roleIDToRole = (roleID) => {
  const id = roleID === undefined || roleID === null ? null : String(roleID);
  if (!id) return null;
  if (id === "1") return "customer";
  if (id === "2") return "admin";
  if (id === "3") return "staff";
  return null;
};

const getRoleFromDecoded = (decoded) => {
  if (typeof decoded?.role === "string" && decoded.role.trim()) {
    return decoded.role.trim().toLowerCase();
  }
  return roleIDToRole(decoded?.roleID);
};

const extractAccessToken = (req) => {
  const header = req.headers.authorization;
  const bearerMatch = typeof header === "string" ? BEARER.exec(header.trim()) : null;
  if (bearerMatch) return bearerMatch[1];
  return (
    req.cookies?.accessToken ||
    req.cookies?.access_token ||
    req.session?.token ||
    null
  );
};

const buildUserContext = async (decoded) => {
  const id = decoded?.id ?? decoded?.userId;
  const role = getRoleFromDecoded(decoded);
  if (!id || !role) return null;

  let email = decoded?.email ?? null;
  if (!email) {
    const user = await Users.findByPk(id);
    email = user?.email ?? null;
  }

  let roleID =
    decoded?.roleID != null && decoded.roleID !== ""
      ? String(decoded.roleID)
      : null;
  if (!roleID && role) {
    const byRole = { customer: "1", admin: "2", staff: "3" };
    roleID = byRole[role] ?? null;
  }

  return { id, email, role, ...(roleID ? { roleID } : {}) };
};

export const authenticate = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return sendError(res, 500, "Server configuration error", null);
  }

  const token = extractAccessToken(req);
  if (!token) {
    return sendError(res, 401, "Unauthorized", null);
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await buildUserContext(decoded);
    if (!user) {
      return sendError(res, 401, "Unauthorized", null);
    }
    req.user = user;
    return next();
  } catch {
    return sendError(res, 401, "Token is invalid or expired", null);
  }
};
