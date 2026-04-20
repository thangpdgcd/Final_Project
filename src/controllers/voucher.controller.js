import { sendError, sendSuccess } from "../utils/response.js"
import { voucherApplyService } from "../services/voucherApply.service.js"
import { authenticate } from "../middlewares/authenticate.js"
import { createVoucherService } from "../services/voucher.service.js"

const voucherService = createVoucherService()

export const voucherController = {
  apply: [
    authenticate,
    async (req, res) => {
      try {
        const body = req.body ?? {}
        const data = await voucherApplyService.apply({
          code: body.code,
          orderValue: body.orderValue ?? body.order_value ?? body.total ?? body.totalAmount,
          userId: body.userId ?? req.user?.id ?? req.user?.userId,
        })
        return sendSuccess(res, 200, data, "OK")
      } catch (error) {
        const status = Number(error?.statusCode || error?.status) || 500
        return sendError(res, status, error?.message || "Error", null)
      }
    },
  ],

  me: [
    authenticate,
    async (req, res) => {
      try {
        const userId = req.user?.id ?? req.user?.userId
        const rows = await voucherService.listActiveVouchersForUser({ userId })
        return sendSuccess(res, 200, { vouchers: rows }, "OK")
      } catch (error) {
        const status = Number(error?.statusCode || error?.status) || 500
        return sendError(res, status, error?.message || "Error", null)
      }
    },
  ],
}

