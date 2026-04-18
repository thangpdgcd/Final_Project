import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";
import { getUserAvatar } from "../../utils/userAvatar.js";

const allowedRoles = ["1", "2", "3"]; // 1=customer, 2=admin, 3=staff

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+]{9,15}$/;

export const createAuthService = ({ authRepository }) => {
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

  const login = async (email, password) => {
    const emailNorm = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailNorm || !password) {
      throw new AppError(400, "Email and password are required.");
    }
    if (!emailRegex.test(emailNorm)) {
      throw new AppError(400, "Invalid email address.");
    }

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
    generateTokens,
    refreshAccessToken,
    changePassword,
  };
};

