import express from "express"
import { voucherController } from "../controllers/voucher.controller.js"

const router = express.Router()

router.post("/apply", ...voucherController.apply)
router.get("/me", ...voucherController.me)

export const initVoucherRoutes = (app) => {
  app.use("/api/vouchers", router)
}

