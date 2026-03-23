import jwt from "jsonwebtoken";

/**
 * Middleware verify token - bảo vệ các route cần đăng nhập
 * Lấy token từ (theo thứ tự ưu tiên):
 * 1. Authorization header (Bearer) - API, Swagger
 * 2. HttpOnly cookie (access_token) - Web app an toàn
 * 3. Session - EJS form login
 */
const authMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.cookies?.access_token ||
    req.session?.token;

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded; // { id, roleID } - dùng trong controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

export default authMiddleware;
