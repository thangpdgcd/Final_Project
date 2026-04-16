import { sendSuccess, sendError } from "../../utils/response.js";

export const createStaffController = ({ staffService }) => {
  const getAllUsers = async (req, res) => {
    try {
      const data = await staffService.getAllUsers();
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const getUsersById = async (req, res) => {
    try {
      const id = req.params.id;
      const data = await staffService.getUserById(id);
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const createAdmin = async (req, res) => {
    try {
      const result = await staffService.createUser(req.body);
      return sendSuccess(res, 201, result, "Created");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const updateUsers = async (req, res) => {
    try {
      const id = req.params.id;
      const result = await staffService.updateUser(id, req.body);
      return sendSuccess(res, 200, result, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  const deleteUsers = async (req, res) => {
    try {
      const id = req.params.id;
      await staffService.deleteUser(id);
      return sendSuccess(res, 200, null, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  };

  return {
    getAllUsers,
    getUsersById,
    createAdmin,
    updateUsers,
    deleteUsers,
  };
};

