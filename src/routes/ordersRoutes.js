// src/routes/ordersRoutes.js
import express from "express";
import OrdersController from "../controllers/ordersController.js";

const router = express.Router();

/* ================== CRUD ORDERS ================== */

// POST /api/orders
router.post("/create-orders", OrdersController.createOrders);

// GET /api/orders/:id
router.get("/orders/:id", OrdersController.getOrderById);

// PUT /api/orders/:id
router.put("/orders/:id", OrdersController.updateOrders);

// DELETE /api/orders/:id
router.delete("/orders/:id", OrdersController.deleteOrders);

/* ================== INIT ================== */
const initOrdersRoutes = (app) => {
  app.use("/api/orders", router);
};

export default initOrdersRoutes;
