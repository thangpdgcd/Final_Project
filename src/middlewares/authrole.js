// middlewares/authorizeRoles.js
// Dùng kết hợp với authMiddleware. req.user.roleID từ JWT payload.

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const roleID = req.user?.roleID;

    if (!roleID || !allowedRoles.includes(String(roleID))) {
      return res.status(403).json({ message: "Không có quyền truy cập." });
    }

    next();
  };
};

export default authorizeRoles;
