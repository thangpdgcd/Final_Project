import usersService from "../../src/service/usersServices.js";

// Lấy tất cả người dùng
let getAllConUsers = async (req, res) => {
  try {
    let users = await usersService.getAllUsers();
    res.render("users", { title: "Users List", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy 1 người dùng theo ID
let getOneUsers = async (req, res) => {
  try {
    let id = req.params.id;
    let users = await usersService.getUsersById(id);
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo người dùng mới
let createUsers = async (req, res) => {
  try {
    let data = req.body;
    let newUsers = await usersService.createUsers(data);
    res.status(201).json(newUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật người dùng
let updateUsers = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updatedUsers = await usersService.updateUsers(id, data);
    res.status(200).json(updatedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xoá người dùng
let deleteUsers = async (req, res) => {
  try {
    let id = req.params.id;
    await usersService.deleteUsers(id);
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
  deleteUsers,
};
