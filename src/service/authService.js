// services/authService.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models from "../models/index.js";

const { Users, Sequelize } = models;

const allowedRoles = ["1", "2", "3"]; // "1" for user, "2" for admin, "3" for manager

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
  // Validate inputs
  if (!name || name.length < 2 || name.length > 50) {
    throw new Error("Name must be between 2 and 50 characters.");
  }

  if (!email || !emailRegex.test(email)) {
    throw new Error("Invalid email address.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    throw new Error("Invalid phone number.");
  }

  const existingUser = await Users.findOne({
    where: {
      [Sequelize.Op.or]: [{ email }],
    },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await Users.create({
    name,
    email,
    address,
    phoneNumber,
    password: hashedPassword,
    roleID: allowedRoles.includes(roleID) ? roleID : "1", // Default is "1" (user)
  });

  return {
    id: newUser.userId,
    name: newUser.Name,
    email: newUser.Email,
    roleID: newUser.roleID,
  };
};

const login = async (Email, password) => {
  if (!Email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!emailRegex.test(Email)) {
    throw new Error("Invalid email address.");
  }

  const user = await Users.findOne({ where: { Email } });

  if (!user) throw new Error("Incorrect email or password.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Incorrect email or password.");
  }

  const token = jwt.sign(
    { id: user.userId, roleID: user.roleID },
    process.env.JWT_SECRET || "SECRET_KEY",
    { expiresIn: "1h" }, // Token chỉ có hiệu lực trong 1 giờ
  );

  return {
    token,
    user: {
      id: user.userId,
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
