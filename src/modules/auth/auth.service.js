import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";

const allowedRoles = ["1", "2", "3"]; // 1=customer, 2=admin, 3=staff

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+]{9,15}$/;

export const createAuthService = ({ authRepository }) => {
  const generateTokens = (user) => {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new AppError(500, "Server configuration error");
    }

    const payload = { id: user.userId, roleID: user.roleID };
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

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        roleID: user.roleID,
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

  return {
    registerUser,
    login,
    generateTokens,
    refreshAccessToken,
  };
};

