// src/routes/ordersRoutes.js
import express from "express";
import ordersController from "../../src/controllers/ordersController.js"; // ✅ Đã thêm "s"

const router = express.Router();

// GET all orders
router.get("/orders", ordersController.getAllOrders);

// GET order by ID
router.get("/orders/:id", ordersController.getOrdersById);

// POST create order
router.post("/create-orders", ordersController.createOrders);

// PUT update order
router.put("/orders/:id", ordersController.updateOrders);

// DELETE order
router.delete("/orders/:id", ordersController.deleteOrders);

// Attach all order routes under /api
const initOrdersRoutes = (app) => {
  app.use("/api", router); // /api/orders, /api/create-orders
};

export default initOrdersRoutes;
