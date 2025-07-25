import express from "express";
import PaymentController from "../controllers/paymentsController.js"; // Import controller for Payment operations
const router = express.Router();

// GET tất cả thanh toán
router.get("/payments", PaymentController.getAllPayments);

// GET thanh toán theo ID
router.get("/payments/:id", PaymentController.getPaymentsById);

// POST tạo thanh toán
router.post("/create-payment", PaymentController.createPayments);

// PUT cập nhật thanh toán
router.put("/payments/:id", PaymentController.updatePayments);

// DELETE xóa thanh toán
router.delete("/payments/:id", PaymentController.deletePayments);

// Hàm khởi tạo routes
const initPaymentRoutes = (app) => {
  app.use("/api", router); // /api/payments, /api/payments/:id, ...
};

export default initPaymentRoutes;
