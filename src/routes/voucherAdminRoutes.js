import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { isStaffOrAdmin } from "../middlewares/authorize.js";
import { voucherAdminController } from "../controllers/voucherAdmin.controller.js";

const router = express.Router();
const guard = [authenticate, isStaffOrAdmin];

router.get("/", ...guard, voucherAdminController.list);
router.post("/", ...guard, voucherAdminController.create);
router.put("/:id", ...guard, voucherAdminController.update);
router.delete("/:id", ...guard, voucherAdminController.remove);

const initVoucherAdminRoutes = (app) => {
  app.use("/api/vouchers", router);
};

export default initVoucherAdminRoutes;
