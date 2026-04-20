import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { sendError } from "../utils/response.js";
import { getUserAvatar } from "../utils/userAvatar.js";

const { Users } = models;

const BEARER = /^Bearer\s+(\S+)$/i;

const roleIDToRole = (roleID) => {
  const id = roleID === undefined || roleID === null ? null : String(roleID);
  if (!id) return null;
  const v = id.trim().toLowerCase();
  if (v === "1" || v === "customer" || v === "user") return "customer";
  if (v === "2" || v === "admin") return "admin";
  if (v === "3" || v === "staff") return "staff";
  return null;
};

const roleToRoleID = (role) => {
  const r = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (!r) return null;
  if (r === "customer" || r === "user") return "1";
  if (r === "admin") return "2";
  if (r === "staff") return "3";
  return null;
};

const getRoleFromDecoded = (decoded) => {
  if (typeof decoded?.role === "string" && decoded.role.trim()) {
    const role = decoded.role.trim().toLowerCase();
    if (role === "user") return "customer";
    return role;
  }
  return roleIDToRole(decoded?.roleID);
};

const extractAccessToken = (req) => {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.trim()) {
    const trimmed = header.trim();
    const bearerMatch = BEARER.exec(trimmed);
    if (bearerMatch) return bearerMatch[1];
    // Some clients send the raw token in Authorization without "Bearer"
    if (!/\s/.test(trimmed)) return trimmed;
  }

  // Common alternative headers used by different clients/proxies
  const xAccessToken = req.headers["x-access-token"];
  if (typeof xAccessToken === "string" && xAccessToken.trim()) return xAccessToken.trim();
  const xAuthToken = req.headers["x-auth-token"];
  if (typeof xAuthToken === "string" && xAuthToken.trim()) return xAuthToken.trim();
  const tokenHeader = req.headers["token"];
  if (typeof tokenHeader === "string" && tokenHeader.trim()) return tokenHeader.trim();

  return req.cookies?.accessToken || req.cookies?.access_token || req.session?.token || null;
};

const buildUserContext = async (decoded) => {
  const id = decoded?.id ?? decoded?.userId;
  const fromTokenRole = getRoleFromDecoded(decoded);
  if (!id) return null;

  const user = await Users.findByPk(id);
  const dbRoleID = user?.roleID != null ? String(user.roleID) : null;
  const role = fromTokenRole ?? roleIDToRole(dbRoleID);
  if (!role) return null;
  let email = decoded?.email ?? null;
  if (!email) email = user?.email ?? null;

  let roleID =
    decoded?.roleID != null && decoded.roleID !== ""
      ? String(decoded.roleID)
      : null;
  if (!roleID) roleID = roleToRoleID(role) ?? dbRoleID;

  const avatar = await getUserAvatar(id);

  return {
    id,
    email,
    role,
    name: user?.name ?? null,
    phoneNumber: user?.phoneNumber ?? null,
    address: user?.address ?? null,
    avatar: avatar ?? null,
    ...(roleID ? { roleID } : {}),
  };
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
    if (process.env.DEBUG_AUTH === "true") {
      // Debug only; avoid logging tokens.
      console.log("[AUTH] USER:", {
        id: user.id,
        role: user.role,
        roleID: user.roleID,
        email: user.email,
      });
    }
    return next();
  } catch {
    return sendError(res, 401, "Token is invalid or expired", null);
  }
};
