import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { requireEnv } from "../config/runtimeEnv.js";
import { AppError } from "../utils/AppError.js";
import { getUserAvatar } from "../utils/userAvatar.js";

const allowedRoles = ["1", "2", "3"]; // 1=customer, 2=admin, 3=staff

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+]{9,15}$/;

export const createAuthService = ({ authRepository }) => {
  const GOOGLE_CLIENT_ID = requireEnv("GOOGLE_CLIENT_ID");
  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

  const normalizeRoleID = (raw) => {
    const v = raw == null ? "" : String(raw).trim().toLowerCase();
    if (!v) return null;
    if (v === "1" || v === "customer" || v === "user") return "1";
    if (v === "2" || v === "admin") return "2";
    if (v === "3" || v === "staff") return "3";
    return null;
  };

  const roleFromRoleID = (roleID) => {
    const id = normalizeRoleID(roleID);
    if (id === "1") return "customer";
    if (id === "2") return "admin";
    if (id === "3") return "staff";
    return null;
  };

  const generateTokens = (user) => {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new AppError(500, "Server configuration error");
    }

    const roleID = normalizeRoleID(user.roleID) ?? "1";
    const role = roleFromRoleID(roleID) ?? "customer";
    const payload = { id: user.userId, roleID, role };
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: "3h" });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  };

  const registerUser = async ({ name, email, address, phoneNumber, password, roleID }) => {
    if (!name || name.length < 2 || name.length > 50) {
      throw new AppError(400, "Name must be between 2 and 50 characters.");
    }
    if (!email || !emailRegex.test(email)) {
      throw new AppError(400, "Invalid email address.");
    }
    if (!password || password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters long.");
    }
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      throw new AppError(400, "Invalid phone number.");
    }

    const emailNorm = email.trim().toLowerCase();
    const exists = await authRepository.existsByEmail(emailNorm);
    if (exists) {
      throw new AppError(400, "Email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await authRepository.createUser({
      name,
      email: emailNorm,
      address,
      phoneNumber,
      passwordHash,
      roleID: allowedRoles.includes(String(roleID)) ? String(roleID) : "1",
    });

    return {
      id: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      roleID: newUser.roleID,
    };
  };

  const boolFromEnv = (key, fallback = false) => {
    const raw = process.env[key];
    if (raw == null || String(raw).trim() === "") return fallback;
    const v = String(raw).trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes" || v === "y";
  };

  const shouldAutoSeedDefaultAccounts = () => {
    // Many hosted environments don't run sequelize seeders automatically.
    // Enable an idempotent auto-seed for ONLY known default accounts.
    // Can be disabled by setting AUTO_SEED_DEFAULT_ACCOUNTS=false.
    return boolFromEnv("AUTO_SEED_DEFAULT_ACCOUNTS", true);
  };

  const defaultAccounts = () => {
    // Allow overrides via env (recommended on production).
    return [
      {
        email: String(process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com").trim().toLowerCase(),
        name: String(process.env.DEFAULT_ADMIN_NAME || "Admin Account"),
        roleID: "2",
        password: String(process.env.DEFAULT_ADMIN_PASSWORD || "123456"),
        phoneNumber: String(process.env.DEFAULT_ADMIN_PHONE || "0900000001"),
        address: String(process.env.DEFAULT_ADMIN_ADDRESS || "District 1, Ho Chi Minh City"),
      },
      {
        email: String(process.env.DEFAULT_STAFF_EMAIL || "staff@example.com").trim().toLowerCase(),
        name: String(process.env.DEFAULT_STAFF_NAME || "Staff Account"),
        roleID: "3",
        password: String(process.env.DEFAULT_STAFF_PASSWORD || "123456"),
        phoneNumber: String(process.env.DEFAULT_STAFF_PHONE || "0900000002"),
        address: String(process.env.DEFAULT_STAFF_ADDRESS || "Thu Duc, Ho Chi Minh City"),
      },
    ];
  };

  const ensureDefaultAccountIfMissing = async (emailNorm) => {
    if (!shouldAutoSeedDefaultAccounts()) return;
    const acct = defaultAccounts().find((a) => a.email === emailNorm);
    if (!acct) return;

    const exists = await authRepository.existsByEmail(acct.email);
    if (exists) return;

    // Create idempotently; in rare races the UNIQUE index will win.
    const passwordHash = await bcrypt.hash(acct.password, 10);
    try {
      await authRepository.createUser({
        name: acct.name,
        email: acct.email,
        address: acct.address,
        phoneNumber: acct.phoneNumber,
        passwordHash,
        roleID: acct.roleID,
      });
    } catch {
      // Ignore if another process created it concurrently.
    }
  };

  const login = async (email, password) => {
    const emailNorm = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailNorm || !password) {
      throw new AppError(400, "Email and password are required.");
    }
    if (!emailRegex.test(emailNorm)) {
      throw new AppError(400, "Invalid email address.");
    }

    // Hosted DB may not have seeders executed. Auto-seed known default accounts if missing.
    await ensureDefaultAccountIfMissing(emailNorm);

    const user = await authRepository.findByEmail(emailNorm);
    if (!user) {
      throw new AppError(401, "Incorrect email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(401, "Incorrect email or password.");
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const avatar = await getUserAvatar(user.userId);
    const normalizedRoleID = normalizeRoleID(user.roleID) ?? "1";

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        roleID: normalizedRoleID,
        avatar,
        phoneNumber: user.phoneNumber ?? null,
        address: user.address ?? null,
      },
    };
  };

  const loginWithGoogle = async ({ idToken }) => {
    const token = typeof idToken === "string" ? idToken.trim() : "";
    if (!token) throw new AppError(400, "token is required");

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(401, "Invalid Google token");
    }

    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const picture = typeof payload?.picture === "string" ? payload.picture.trim() : "";
    const emailVerified = payload?.email_verified;

    if (!email) throw new AppError(401, "Google token missing email");
    if (emailVerified === false) throw new AppError(401, "Google email is not verified");

    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await authRepository.findOrCreateGoogleUser({
      email,
      name,
      avatar: picture || null,
      roleID: "1",
      passwordHash,
    });

    if (!user) throw new AppError(500, "Could not create user");

    const { accessToken, refreshToken } = generateTokens(user);
    const normalizedRoleID = normalizeRoleID(user.roleID) ?? "1";
    const avatar = user.avatar ?? (await getUserAvatar(user.userId));

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        roleID: normalizedRoleID,
        avatar: avatar ?? null,
        phoneNumber: user.phoneNumber ?? null,
        address: user.address ?? null,
        provider: user.provider ?? "google",
      },
    };
  };

  const refreshAccessToken = async ({ refreshToken }) => {
    if (!refreshToken) {
      throw new AppError(401, "Refresh token not found.");
    }
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new AppError(500, "Server configuration error");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch {
      throw new AppError(401, "Invalid or expired refresh token.");
    }

    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw new AppError(401, "User not found.");
    }

    const tokens = generateTokens(user);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  };

  const changePassword = async ({ userId, oldPassword, newPassword }) => {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new AppError(401, "Unauthorized");

    const oldPw = String(oldPassword ?? "");
    const newPw = String(newPassword ?? "");
    if (!oldPw) throw new AppError(400, "oldPassword is required");
    if (!newPw || newPw.length < 6) {
      throw new AppError(400, "newPassword must be at least 6 characters long.");
    }

    const user = await authRepository.findById(uid);
    if (!user) throw new AppError(404, "User not found.");

    const ok = await bcrypt.compare(oldPw, String(user.password ?? ""));
    if (!ok) throw new AppError(400, "Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPw, 10);
    await authRepository.updatePasswordHash({ userId: uid, passwordHash });

    return { ok: true };
  };

  return {
    registerUser,
    login,
    loginWithGoogle,
    generateTokens,
    refreshAccessToken,
    changePassword,
  };
};

