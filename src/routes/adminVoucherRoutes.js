import express from "express"
import { authenticate } from "../middlewares/authenticate.js"
import { isAdmin } from "../middlewares/authorize.js"
import { adminVoucherController } from "../controllers/adminVoucher.controller.js"

const router = express.Router()
const guard = [authenticate, isAdmin]

router.post("/", ...guard, adminVoucherController.create)
router.get("/", ...guard, adminVoucherController.list)
router.get("/:id", ...guard, adminVoucherController.detail)
router.put("/:id", ...guard, adminVoucherController.update)
router.delete("/:id", ...guard, adminVoucherController.remove)

export const initAdminVoucherRoutes = (app) => {
  app.use("/api/admin/vouchers", router)
}

