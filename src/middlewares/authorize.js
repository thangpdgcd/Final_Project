import { sendError } from "../utils/response.js";

const normalizeRole = (raw) => {
  const r = String(raw ?? "").trim().toLowerCase();
  if (!r) return null;
  if (r === "user" || r === "customer" || r === "1") return "customer";
  if (r === "admin" || r === "2") return "admin";
  if (r === "staff" || r === "3") return "staff";
  return null;
};

/**
 * Role-based authorization middleware.
 * Accepts roles as strings ("admin"|"staff"|"customer") or numeric ids (1|2|3).
 *
 * Example: authorizeRoles("admin", "staff") or authorizeRoles(2, 3)
 */
export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    const role = normalizeRole(req.user?.role ?? req.user?.roleID);
    if (!role) return sendError(res, 401, "Unauthorized", null);

    const allowed = roles.map(normalizeRole).filter(Boolean);
    if (!allowed.includes(role)) {
      return sendError(res, 403, "You are not authorized to perform this action", null);
    }
    return next();
  };

// Backwards-compatible names
export const checkRole = (allowedRoles = []) =>
  authorizeRoles(...(Array.isArray(allowedRoles) ? allowedRoles : []));

export const isAdmin = authorizeRoles("admin");
export const isStaffOrAdmin = authorizeRoles("staff", "admin");
export const isCustomer = authorizeRoles("customer");
