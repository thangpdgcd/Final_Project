import { sendError } from "../utils/response.js";

export const checkRole = (allowedRoles = []) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return sendError(res, 401, "Unauthorized", null);
  }

  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(role)) {
    return sendError(res, 403, "You are not authorized to perform this action", null);
  }

  return next();
};

export const isAdmin = checkRole(["admin"]);
export const isStaffOrAdmin = checkRole(["staff", "admin"]);
export const isCustomer = checkRole(["customer"]);
