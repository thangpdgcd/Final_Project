// src/routes/orderItemsRoutes.js
import express from "express";
import orderItemsController from "../../src/controllers/orderItemsController.js"; // ✅ Đảm bảo đúng tên file

const router = express.Router();

// GET all order items
router.get("/order-items", orderItemsController.getAllOrderItems);

// GET order item by ID
router.get("/order-items/:id", orderItemsController.getOrderItemsById);

// POST create order item
router.post("/create-order-item", orderItemsController.createOrderItems);

// PUT update order item
router.put("/order-items/:id", orderItemsController.updateOrderItems);

// DELETE order item
router.delete("/order-items/:id", orderItemsController.deleteOrderItems);

// Attach all order item routes under /api
const initOrderItemsRoutes = (app) => {
  app.use("/api", router); // Ví dụ: /api/order-items, /api/create-order-item
};

export default initOrderItemsRoutes;
