import express from "express";
import CategoriesController from "../controllers/CategoriesController.js"; // Import controller for Categories operations

const router = express.Router();

// GET tất cả danh mục
router.get("/categories", CategoriesController.getAllCategories);

// GET danh mục theo ID
router.get("/categories/:id", CategoriesController.getCategoriesById);

// POST tạo danh mục
router.post("/create-categories", CategoriesController.createCategories);

// PUT cập nhật danh mục
router.put("/categories/:id", CategoriesController.updateCategories);

// DELETE xóa danh mục
router.delete("/categories/:id", CategoriesController.deleteCategories);

// Hàm khởi tạo routes
const initCategoriesRoutes = (app) => {
  app.use("/api", router); // /api/categories, /api/categories/:id
};

export default initCategoriesRoutes;
