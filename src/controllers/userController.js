import userService from "../service/userservice.js";

// Lấy tất cả người dùng
const getAllConUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 1 người dùng theo ID
const getOneUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo người dùng mới
const createUsers = async (req, res) => {
  try {
    const data = req.body;
    const newUser = await userService.createUser(data);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật người dùng
const updateUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedUser = await userService.updateUser(id, data);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xoá người dùng
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await userService.deleteUser(id);
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAllConUsers,
  getOneUsers,
  createUsers,
  updateUsers,
  deleteUser,
};
