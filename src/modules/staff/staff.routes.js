import express from "express";
import authMiddleware from "../../core/middlewares/auth.js";
import { isStaffOrAdmin } from "../../middlewares/authMiddleware.js";
import { createStaffRepository } from "./staff.repository.js";
import { createStaffService } from "./staff.service.js";
import { createStaffController } from "./staff.controller.js";
import { orderService } from "../../modules/order/order.service.js";
import { createVoucherService } from "../../services/voucher.service.js";
import uploadCloud from "../../config/uploadConfig.js";

export const buildStaffRouter = () => {
  const router = express.Router();

  const staffRepository = createStaffRepository();
  const staffService = createStaffService({ staffRepository });
  const voucherService = createVoucherService();
  const staffController = createStaffController({ staffService, voucherService, orderService });

  const guard = [authMiddleware, isStaffOrAdmin];

  router.get("/users", ...guard, staffController.getAllUsers);
  router.get("/users/:id", ...guard, staffController.getUsersById);
  router.post("/create-users", ...guard, staffController.createAdmin);
  router.put("/users/:id", ...guard, staffController.updateUsers);
  router.delete("/users/:id", ...guard, staffController.deleteUsers);
  router.post("/staff/voucher/create", ...guard, staffController.createManualVoucher);

  // Voucher CRUD (staff only)
  router.get("/staff/vouchers", ...guard, staffController.listVouchers);
  router.put("/staff/vouchers/:id", ...guard, staffController.updateVoucher);
  router.delete("/staff/vouchers/:id", ...guard, staffController.deleteVoucher);

  // Profile
  router.get("/staff/profile", ...guard, staffController.getProfile);
  router.put("/staff/profile", ...guard, staffController.updateProfile);
  router.put("/staff/profile/password", ...guard, staffController.changePassword);
  router.post(
    "/staff/profile/avatar",
    ...guard,
    uploadCloud.single("avatar"),
    staffController.uploadAvatar,
  );

  // Email (mock)
  router.post("/staff/email/send", ...guard, staffController.sendEmail);

  // Analytics
  router.get("/staff/analytics", ...guard, staffController.getAnalytics);

  return router;
};
