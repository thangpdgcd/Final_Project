import userService from "../service/userservice.js";

// Lấy tất cả người dùng
let getAllConUsers = async (req, res) => {
  try {
    let users = await userService.getAllUsers();
    res.render("users", { title: "User List", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 1 người dùng theo ID
let getOneUsers = async (req, res) => {
  try {
    let id = req.params.id;
    let user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo người dùng mới
let createUsers = async (req, res) => {
  try {
    let data = req.body;
    let newUser = await userService.createUser(data);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật người dùng
let updateUsers = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updatedUser = await userService.updateUser(id, data);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xoá người dùng
let deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
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
