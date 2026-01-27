// src/routes/ordersRoutes.js
import express from "express";
import OrdersController from "../controllers/ordersController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Orders management APIs
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Get orders successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get("/orders", OrdersController.getAllOrders);

/**
 * @swagger
 * /api/create-orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - totalPrice
 *             properties:
 *               userId:
 *                 type: integer
 *               totalPrice:
 *                 type: number
 *               status:
 *                 type: string
 *                 example: pending
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-orders", OrdersController.createOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Get order successfully
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", OrdersController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *               totalPrice:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/orders/:id", OrdersController.updateOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete("/orders/:id", OrdersController.deleteOrders);

/* ================== INIT ================== */
const initOrdersRoutes = (app) => {
  app.use("/api", router);
};

export default initOrdersRoutes;
