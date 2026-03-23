import express from "express";
import productsController from "../controllers/productsController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security: []
 *     responses:
 *       200:
 *         description: Get products successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get("/products", productsController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Get product successfully
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", productsController.getProductsById);

/**
 * @swagger
 * /api/create-products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Arabica Coffee
 *               price:
 *                 type: number
 *                 example: 120000
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 example: https://cdn.example.com/product.jpg
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-products", authMiddleware, productsController.createProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/products/:id", authMiddleware, productsController.updateProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/products/:id", authMiddleware, productsController.deleteProducts);

/* ================== INIT ================== */
const initProductsRoutes = (app) => {
  app.use("/api", router);
};

export default initProductsRoutes;
