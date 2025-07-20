import express from "express";
import categoryController from "../controllers/categoryController.js"; // Import controller for category operations

const router = express.Router();

// GET tất cả danh mục
router.get("/categories", categoryController.getAllCategories);

// GET danh mục theo ID
router.get("/categories/:id", categoryController.getCategoryById);

// POST tạo danh mục
router.post("/create-categories", categoryController.createCategory);

// PUT cập nhật danh mục
router.put("/categories/:id", categoryController.updateCategory);

// DELETE xóa danh mục
router.delete("/categories/:id", categoryController.deleteCategory);

// Hàm khởi tạo routes
const initCategoryRoutes = (app) => {
  app.use("/api", router); // /api/categories, /api/categories/:id
};

export default initCategoryRoutes;
