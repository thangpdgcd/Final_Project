import db from "../models/index.js"; // Import models from index.js

const { User } = db;

// Lấy tất cả người dùng
const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw new Error("Không thể lấy danh sách người dùng: " + error.message);
  }
};

// Lấy 1 người dùng theo ID
const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  } catch (error) {
    throw new Error("Không thể lấy thông tin người dùng: " + error.message);
  }
};

// Tạo người dùng mới
const createUser = async (data) => {
  try {
    const { Name, Email, Address, PhoneNumber } = data;
    const newUser = await User.create({ Name, Email, Address, PhoneNumber });
    return newUser;
  } catch (error) {
    throw new Error("Không thể tạo người dùng: " + error.message);
  }
};

// Cập nhật người dùng
const updateUser = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new Error("Người dùng không tồn tại");

    await user.update(data);
    return user;
  } catch (error) {
    throw new Error("Không thể cập nhật người dùng: " + error.message);
  }
};

// Xoá người dùng
const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new Error("Người dùng không tồn tại");

    await user.destroy();
    return;
  } catch (error) {
    throw new Error("Không thể xoá người dùng: " + error.message);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
