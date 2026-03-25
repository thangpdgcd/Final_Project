import jwt from "jsonwebtoken";
import models from "../models/index.js";

const { Users } = models;

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

/**
 * verifyToken middleware
 * - Sources (priority):
 *   1) Authorization: Bearer <token>
 *   2) Cookie: accessToken
 */
export const verifyToken = async (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id = decoded?.id;
    const role = getRoleFromDecoded(decoded);

    if (!id || !role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let email = decoded?.email ?? null;
    if (!email) {
      const user = await Users.findByPk(id);
      email = user?.email ?? null;
    }

    req.user = { id, email, role };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};

/**
 * checkRole(allowedRoles) middleware factory
 * - allowedRoles: string[]
 */
export const checkRole = (allowedRoles = []) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to perform this action",
    });
  }

  return next();
};

// Helper middlewares
export const isAdmin = checkRole(["admin"]);
export const isStaffOrAdmin = checkRole(["staff", "admin"]);
export const isCustomer = checkRole(["customer"]);

