import express from "express";
import productController from "../controllers/productController.js"; // Import the product controller

const router = express.Router();

// GET all products
router.get("/products", productController.getAllProducts);

// GET product by ID
router.get("/products/:id", productController.getProductById);

// POST create product
router.post("/create-product", productController.createProduct);

// PUT update product
router.put("/products/:id", productController.updateProduct);

// DELETE product
router.delete("/products/:id", productController.deleteProduct);

// nếu dùng EJS

// Attach all product routes under /api
const initProductRoutes = (app) => {
  app.use("/api", router); // /api/products, /api/products/:id, etc.
};

export default initProductRoutes;
