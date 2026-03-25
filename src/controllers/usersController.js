import userService from "../service/usersServices.js";
import models from "../models/index.js";

let getAllUsers = async (req, res) => {
  try {
    const data = await userService.getAllUsers();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getUsersbyID = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await userService.getUsersById(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let createAdmin = async (req, res) => {
  try {
    const data = req.body;
    const result = await userService.createAdmin(data);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let updateUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await userService.updateUsers(id, data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let deleteUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userService.deleteUsers(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body;
    const userId = req.user.id;

    const user = await models.Users.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address
    });

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const userId = req.user.id;
    const user = await models.Users.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Model/migration may not include `avatar`; avoid 500s so you can still test upload end-to-end.
    if (!Object.prototype.hasOwnProperty.call(user.dataValues, "avatar")) {
      return res.status(200).json({
        message: "Avatar uploaded (DB field `avatar` not configured in model).",
        avatarUrl: req.file.path,
      });
    }

    await user.update({ avatar: req.file.path });

    return res.status(200).json({ 
      message: "Avatar uploaded successfully", 
      avatarUrl: req.file.path 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getAllUsers,
  getUsersbyID,
  createAdmin,
  updateUsers,
  deleteUsers,
  updateProfile,
  uploadAvatar
};
