import authService from "../service/authService.js";
import jwt from "jsonwebtoken";
import models from "../models/index.js";

let registerUser = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, password, roleID } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tên, Email và mật khẩu là bắt buộc." });
    }
    const finalRoleID =
      roleID !== undefined && roleID !== null && `${roleID}`.trim() !== ""
        ? String(roleID)
        : "1"; // role.user , roleId.user

    const userData = await authService.registerUser({
      name,
      email,
      address,
      phoneNumber,
      password,
      roleID: finalRoleID,
    });

    console.log("✅ Người dùng đã đăng ký thành công:", userData);
    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: userData });
  } catch (error) {
    console.error("❌ Lỗi register:", error);
    return res.status(400).json({ message: error.message });
  }
};

let login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
  }

  try {
    const result = await authService.login(email, password);
    const { accessToken, refreshToken, user } = result;

    const isProduction = process.env.NODE_ENV === "production";
    
    // Refresh Token in HTTP-only cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      // When FE/BE are on different domains (common on Vercel), cookie needs SameSite=None.
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      user
    });
  } catch (error) {
    console.error("❌ Lỗi login:", error);
    return res.status(401).json({ message: error.message });
  }
};

let refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "REFRESH_SECRET");
    
    const user = await models.Users.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      // When FE/BE are on different domains (common on Vercel), cookie needs SameSite=None.
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

let getMe = (req, res) => {
  return res.status(200).json({ user: req.user });
};

let logout = (req, res) => {
  res.clearCookie("refresh_token", { path: "/" });
  if (req.session) {
    req.session.destroy();
  }
  return res.status(200).json({ message: "Đăng xuất thành công." });
};

export default {
  registerUser,
  login,

  // Refresh access token using refresh_token cookie
  refreshToken,

  getMe,
  logout,
};
