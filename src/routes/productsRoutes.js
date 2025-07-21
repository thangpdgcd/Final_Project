import express from "express";
import productsController from "../../src/controllers/productsController.js"; // Import the product controller
const router = express.Router();

// GET all products
router.get("/products", productsController.getAllProducts);

// GET product by ID
router.get("/products/:id", productsController.getProductsById);

// POST create product
router.post("/create-products", productsController.createProducts);

// PUT update product
router.put("/products/:id", productsController.updateProducts);

// DELETE product

router.delete("/products/:id", productsController.deleteProducts);

// nếu dùng EJS

// Attach all product routes under /api
const initProductsRoutes = (app) => {
  app.use("/api", router); // /api/products, /api/products/:id, etc.
};

export default initProductsRoutes;
