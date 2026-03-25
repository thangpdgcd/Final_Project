/**
 * RBAC/Authorization guard based on:
 * 1) JWT payload role (req.user.role or req.user.roleID)
 * 2) Request Origin port (5173=>admin, 5174=>staff, 5175=>customer)
 */

const PORT_TO_ROLE = {
  "5173": "admin",
  "5174": "staff",
  "5175": "customer",
};

const parseOriginPort = (origin) => {
  if (!origin || typeof origin !== "string") return null;
  try {
    return new URL(origin).port;
  } catch {
    return null;
  }
};

const getRoleFromJwt = (user) => {
  // If JWT already has the expected `role: admin|staff|customer`
  if (typeof user?.role === "string" && user.role.trim()) {
    return user.role.trim().toLowerCase();
  }

  // Your current JWT uses `roleID` (1=user/customer, 2=admin, 3=staff)
  const roleID = user?.roleID;
  if (roleID === undefined || roleID === null) return null;

  const id = String(roleID);
  if (id === "1") return "customer";
  if (id === "2") return "admin";
  if (id === "3") return "staff";
  return null;
};

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const originPort = parseOriginPort(req.headers.origin);
  const expectedFromPort = originPort ? PORT_TO_ROLE[originPort] : null;
  if (!expectedFromPort) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const tokenRole = getRoleFromJwt(req.user);
  if (!tokenRole || tokenRole !== expectedFromPort) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (allowedRoles && !allowedRoles.includes(tokenRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
};

export const isAdmin = requireRole(["admin"]);
export const isStaff = requireRole(["staff"]);
export const isCustomer = requireRole(["customer"]);

// staff OR admin
export const isStaffOrAdmin = requireRole(["admin", "staff"]);

