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

export const createAuthController = ({ authService }) => {
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
      const status = Number(error?.statusCode || error?.status) || 400;
      return sendError(res, status, error?.message || "Registration failed", null);
    }
  };

  const login = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = req.body?.password;

    try {
      const result = await authService.login(email, password);
      const { accessToken, refreshToken, user } = result;

      res.cookie("refresh_token", refreshToken, cookieSecureOptions(req));
      return sendSuccess(res, 200, { accessToken, user }, "Login successful");
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
      const status = Number(error?.statusCode || error?.status) || 401;
      return sendError(res, status, msg, null);
    }
  };

  const refreshToken = async (req, res) => {
    const token = req.cookies.refresh_token;
    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await authService.refreshAccessToken({ refreshToken: token });

      res.cookie("refresh_token", newRefreshToken, cookieSecureOptions(req));
      // `token` alias: some clients expect `data.token` instead of `data.accessToken`
      return sendSuccess(res, 200, { accessToken, token: accessToken }, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 401;
      return sendError(res, status, error?.message || "Unauthorized", null);
    }
  };

  const getMe = (req, res) => {
    return sendSuccess(res, 200, req.user, "OK");
  };

  const logout = (req, res) => {
    // Must match cookie options used when setting the cookie, otherwise the browser may keep it.
    const opts = cookieSecureOptions(req);
    res.clearCookie("refresh_token", opts);
    // Extra safety: overwrite cookie with immediate expiry.
    res.cookie("refresh_token", "", { ...opts, maxAge: 0 });
    if (req.session) {
      req.session.destroy();
    }
    return sendSuccess(res, 200, null, "Logout successful.");
  };

  const changePassword = async (req, res) => {
    try {
      const userId = req.user?.userId ?? req.user?.id;
      const { oldPassword, newPassword } = req.body ?? {};
      await authService.changePassword({ userId, oldPassword, newPassword });
      return sendSuccess(res, 200, null, "Password changed");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 400;
      return sendError(res, status, error?.message || "Change password failed", null);
    }
  };

  const googleLogin = async (req, res) => {
    try {
      const token = req.body?.token;
      const result = await authService.loginWithGoogle({ idToken: token });
      const { accessToken, refreshToken, user } = result;

      res.cookie("refresh_token", refreshToken, cookieSecureOptions(req));
      // `token` alias for clients expecting `data.token`
      return sendSuccess(res, 200, { accessToken, token: accessToken, user }, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 400;
      return sendError(res, status, error?.message || "Google login failed", null);
    }
  };

  return {
    registerUser,
    login,
    refreshToken,
    getMe,
    logout,
    changePassword,
    googleLogin,
  };
};

