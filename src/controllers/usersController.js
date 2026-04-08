import userService from "../services/usersServices.js";
import models from "../models/index.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getAllUsers = async (req, res) => {
  try {
    const data = await userService.getAllUsers();
    return sendSuccess(res, 200, data, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const getUsersbyID = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await userService.getUsersById(id);
    return sendSuccess(res, 200, data, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const createAdmin = async (req, res) => {
  try {
    const data = req.body;
    const result = await userService.createAdmin(data);
    return sendSuccess(res, 201, result, "Created");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const updateUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await userService.updateUsers(id, data);
    return sendSuccess(res, 200, result, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const deleteUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userService.deleteUsers(id);
    return sendSuccess(res, 200, result, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body;
    const userId = req.user.id;

    const user = await models.Users.findByPk(userId);
    if (!user) return sendError(res, 404, "User not found", null);

    await user.update({
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address,
    });

    return sendSuccess(res, 200, { user }, "Profile updated successfully");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 400, "No file uploaded", null);

    const userId = req.user.id;
    const user = await models.Users.findByPk(userId);
    if (!user) return sendError(res, 404, "User not found", null);

    if (!Object.prototype.hasOwnProperty.call(user.dataValues, "avatar")) {
      return sendSuccess(
        res,
        200,
        { avatarUrl: req.file.path },
        "Avatar uploaded (avatar field not configured on model).",
      );
    }

    await user.update({ avatar: req.file.path });

    return sendSuccess(
      res,
      200,
      { avatarUrl: req.file.path },
      "Avatar uploaded successfully",
    );
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

export default {
  getAllUsers,
  getUsersbyID,
  createAdmin,
  updateUsers,
  deleteUsers,
  updateProfile,
  uploadAvatar,
};
