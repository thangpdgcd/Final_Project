import authService from "../services/authService.js";
import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { sendSuccess, sendError } from "../utils/response.js";

const cookieSecureOptions = (req) => {
  const isSecure =
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, password, roleID } = req.body;
    const finalRoleID =
      roleID !== undefined && roleID !== null && `${roleID}`.trim() !== ""
        ? String(roleID)
        : "1";

    const userData = await authService.registerUser({
      name,
      email,
      address,
      phoneNumber,
      password,
      roleID: finalRoleID,
    });

    return sendSuccess(res, 201, { user: userData }, "Registration successful");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

const login = async (req, res) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = req.body?.password;

  try {
    const result = await authService.login(email, password);
    const { accessToken, refreshToken, user } = result;

    res.cookie("refresh_token", refreshToken, cookieSecureOptions(req));

    return sendSuccess(
      res,
      200,
      { accessToken, user },
      "Login successful",
    );
  } catch (error) {
    const msg = error?.message || "Login failed.";
    const isDb =
      typeof msg === "string" &&
      (msg.includes("ECONNREFUSED") ||
        msg.includes("SequelizeConnectionError") ||
        msg.includes("connect ETIMEDOUT"));
    if (isDb) {
      return sendError(
        res,
        503,
        "Could not connect to the database. Check DB_HOST, DB_PORT, and that MySQL is running.",
        null,
      );
    }
    return sendError(res, 401, msg, null);
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return sendError(res, 401, "Refresh token not found.", null);
  }

  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      return sendError(res, 500, "Server configuration error", null);
    }
    const decoded = jwt.verify(token, refreshSecret);

    const user = await models.Users.findByPk(decoded.id);
    if (!user) {
      return sendError(res, 401, "User not found.", null);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      authService.generateTokens(user);

    res.cookie("refresh_token", newRefreshToken, cookieSecureOptions(req));

    return sendSuccess(res, 200, { accessToken }, "OK");
  } catch {
    return sendError(res, 401, "Invalid or expired refresh token.", null);
  }
};

const getMe = (req, res) => {
  return sendSuccess(res, 200, { user: req.user }, "OK");
};

const logout = (req, res) => {
  res.clearCookie("refresh_token", { path: "/" });
  if (req.session) {
    req.session.destroy();
  }
  return sendSuccess(res, 200, null, "Logout successful.");
};

export default {
  registerUser,
  login,
  refreshToken,
  getMe,
  logout,
};
