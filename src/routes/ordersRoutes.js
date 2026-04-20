import express from "express";
import orderController from "../controllers/ordersController.js";
import OrderItemsController from "../controllers/orderItemsController.js";
import {
  isCustomer,
  isStaff,
  isStaffOrAdmin,
  verifyToken,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Staff/Admin - monitor all orders
router.get("/orders", verifyToken, isStaffOrAdmin, orderController.getAllOrders);

// User - create order from cart (backward-compatible endpoints)
router.post(
  "/create-orders",
  verifyToken,
  orderController.createOrder,
);
router.post(
  "/orders",
  verifyToken,
  orderController.createOrder,
);

/** Current user's orders (JWT). */
router.get("/my-orders", verifyToken, orderController.getMyOrders);
// Admin/Staff - orders of a specific user
router.get(
  "/users/:userId/orders",
  verifyToken,
  isStaffOrAdmin,
  orderController.getUserOrders,
);
router.get("/orders/:id", verifyToken, orderController.getOrderById);
router.delete("/orders/:id", verifyToken, isStaff, orderController.deleteOrder);
router.get("/staff/orders", verifyToken, isStaffOrAdmin, orderController.getStaffOrders);

// Role-based status flow
router.patch(
  "/orders/:id/status",
  verifyToken,
  isStaff,
  orderController.patchOrderStatus,
);
router.patch(
  "/orders/:id/assign",
  verifyToken,
  isStaff,
  orderController.assignOrder,
);
router.patch(
  "/orders/:id/cancel",
  verifyToken,
  isCustomer,
  orderController.cancelOrder,
);
router.patch(
  "/orders/:id/refund-request",
  verifyToken,
  isCustomer,
  orderController.requestRefund,
);
router.patch(
  "/orders/:id/refund",
  verifyToken,
  isStaff,
  orderController.resolveRefund,
);

// Backward-compatible update endpoint (used by old clients)
router.put("/orders/:id", verifyToken, isStaff, orderController.updateOrder);

// Backward-compatible approval endpoint
router.post(
  "/orders/approve/:id",
  verifyToken,
  isStaff,
  orderController.approveOrder,
);

// Order chat
router.get("/orders/:id/messages", verifyToken, orderController.getOrderMessages);
router.post("/orders/:id/messages", verifyToken, orderController.createOrderMessage);

/**
 * Order Items (nested REST)
 * - GET    /api/orders/:orderId/items?include=product
 * - POST   /api/orders/:orderId/items
 * - DELETE /api/orders/:orderId/items/:orderItemId
 */
router.get(
  "/orders/:orderId/items",
  verifyToken,
  OrderItemsController.getOrderItems,
);

router.post(
  "/orders/:orderId/items",
  verifyToken,
  OrderItemsController.createOrderItem,
);

router.delete(
  "/orders/:orderId/items/:orderItemId",
  verifyToken,
  OrderItemsController.deleteOrderItem,
);

// Backward-compat (flat order items)
router.post("/orderitems", verifyToken, OrderItemsController.createOrderItemFlat);
router.post(
  "/create-orderitems",
  verifyToken,
  OrderItemsController.createOrderItemFlat,
);
router.delete(
  "/orderitems/:orderItemId",
  verifyToken,
  OrderItemsController.deleteOrderItemFlat,
);

/* ================== INIT ================== */
const initOrdersRoutes = (app) => {
  app.use("/api", router);
};

export default initOrdersRoutes;
