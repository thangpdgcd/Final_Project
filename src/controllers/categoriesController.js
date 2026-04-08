import CategoriesService from "../services/categoriesService.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getAllCategories = async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      const result = await CategoriesService.searchCategories(name);
      return sendSuccess(res, 200, result, "OK");
    }
    const categories = await CategoriesService.getAllCategories();

    return sendSuccess(res, 200, categories, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const getCategoriesById = async (req, res) => {
  try {
    const id = req.params.id;
    const categories = await CategoriesService.getCategoriesById(id);
    return sendSuccess(res, 200, categories, "OK");
  } catch (error) {
    return sendError(res, 404, error.message, null);
  }
};

const createCategories = async (req, res) => {
  try {
    const data = req.body;
    const newCategories = await CategoriesService.createCategories(data);
    return sendSuccess(res, 201, newCategories, "Created");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

const updateCategories = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedCategories = await CategoriesService.updateCategories(id, data);
    return sendSuccess(res, 200, updatedCategories, "OK");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

const deleteCategories = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await CategoriesService.deleteCategories(id);
    return sendSuccess(res, 200, result, "OK");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

export default {
  getAllCategories,
  getCategoriesById,
  createCategories,
  updateCategories,
  deleteCategories,
};
