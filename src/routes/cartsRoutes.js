import express from "express";
import cartController from "../controllers/cartsController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart APIs
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Get cart by user ID
 *     description: Get all cart items of the logged-in user
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Successfully retrieved cart
 *       401:
 *         description: Unauthorized
 */
router.get("/carts", authMiddleware, cartController.getCartByUserId);

/**
 * @swagger
 * /api/add-to-cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added to cart
 *       400:
 *         description: Bad request
 */
router.post("/add-to-cart", authMiddleware, cartController.addToCart);

/**
 * @swagger
 * /api/cart-items/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Cart item not found
 */
router.put("/cart-items/:cartItemId", authMiddleware, cartController.updateCart);

/**
 * @swagger
 * /api/cart-items/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Cart item removed
 *       404:
 *         description: Cart item not found
 */
router.delete("/cart-items/:cartItemId", authMiddleware, cartController.removeCart);

const initCartRoutes = (app) => {
  // Đăng ký trực tiếp trên app để alias không dấu `-` luôn khớp (một số FE gọi `/cartitems`).
  // Nếu chỉ dựa vào `router` + `app.use("/api", router)` mà process cũ chưa restart vẫn 404.
  app.put("/api/cartitems/:cartItemId", authMiddleware, cartController.updateCart);
  app.delete("/api/cartitems/:cartItemId", authMiddleware, cartController.removeCart);

  app.use("/api", router);
};

export default initCartRoutes;
