import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Lấy token từ cookie, session hoặc header
  const token =
    req.cookies?.token ||
    req.session?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.render("homeapi", {
      message: "Vui lòng đăng nhập để tiếp tục.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(404).json({ message: "Token không hợp lệ." });
  }
};

export default authMiddleware;
