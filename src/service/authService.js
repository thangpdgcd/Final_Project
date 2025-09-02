// services/authService.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models from "../models/index.js";

const { Users, Sequelize } = models;

const allowedRoles = ["1", "2", "3"]; // "1" for user, "2" for admin, "3" for manager

// Regex để kiểm tra email và số điện thoại
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+]{9,15}$/;

const registerUser = async ({
  name,
  email,
  address,
  phoneNumber,
  password,
  roleID,
}) => {
  // Validate đầu vào
  if (!name || name.length < 2 || name.length > 50) {
    throw new Error("Tên phải từ 2 đến 50 ký tự.");
  }

  if (!email || !emailRegex.test(email)) {
    throw new Error("Email không hợp lệ.");
  }

  if (!password || password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  const existingUser = await Users.findOne({
    where: {
      [Sequelize.Op.or]: [{ email }],
    },
  });

  if (existingUser) {
    throw new Error("Email đã tồn tại.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await Users.create({
    name,
    email,
    address,
    phoneNumber,
    password: hashedPassword,
    role: allowedRoles.includes(role) ? roleID : "1", // Mặc định là "1" (user)
  });

  return {
    id: newUser.user_ID,
    name: newUser.Name,
    email: newUser.Email,
    roleID: newUser.roleID,
  };
};

const login = async (Email, password) => {
  if (!Email || !password) {
    throw new Error("Email và mật khẩu là bắt buộc.");
  }

  if (!emailRegex.test(Email)) {
    throw new Error("Email không hợp lệ.");
  }

  const user = await Users.findOne({ where: { Email } });

  if (!user) throw new Error("Sai tài khoản hoặc mật khẩu.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai tài khoản hoặc mật khẩu.");

  const token = jwt.sign(
    { id: user.user_ID, roleID: user.roleID },
    process.env.JWT_SECRET || "SECRET_KEY",
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.user_ID,
      name: user.Name,
      email: user.Email,
      roleID: user.roleID,
    },
  };
};

export default {
  registerUser,
  login,
};
