import productsService from "../services/productsService.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getAllProducts = async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      const result = await productsService.searchProducts(name);
      return sendSuccess(res, 200, result, "OK");
    }
    const products = await productsService.getAllProducts();
    return sendSuccess(res, 200, products, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const getProductsById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await productsService.getProductsById(id);
    return sendSuccess(res, 200, product, "OK");
  } catch (error) {
    return sendError(res, 404, error.message, null);
  }
};

const createProducts = async (req, res) => {
  try {
    const newProduct = await productsService.createProducts(req.body);
    return sendSuccess(res, 201, newProduct, "Created");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

const updateProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await productsService.updateProducts(id, req.body);
    return sendSuccess(res, 200, updated, "OK");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

const deleteProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await productsService.deleteProducts(id);
    return sendSuccess(res, 200, result, "OK");
  } catch (error) {
    return sendError(res, 400, error.message, null);
  }
};

export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
};
