import { sendError, sendSuccess } from "../utils/response.js"
import { promoVoucherService } from "../services/promoVoucher.service.js"

export const adminVoucherController = {
  create: async (req, res) => {
    try {
      const created = await promoVoucherService.create(req.body ?? {}, {
        createdByUserId: req.user?.id ?? req.user?.userId,
      })
      return sendSuccess(res, 201, created, "Created")
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500
      return sendError(res, status, error?.message || "Error", null)
    }
  },

  list: async (req, res) => {
    try {
      const data = await promoVoucherService.list(req.query ?? {})
      return sendSuccess(res, 200, data, "OK")
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500
      return sendError(res, status, error?.message || "Error", null)
    }
  },

  detail: async (req, res) => {
    try {
      const data = await promoVoucherService.getById(req.params.id)
      return sendSuccess(res, 200, data, "OK")
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500
      return sendError(res, status, error?.message || "Error", null)
    }
  },

  update: async (req, res) => {
    try {
      const data = await promoVoucherService.update(req.params.id, req.body ?? {})
      return sendSuccess(res, 200, data, "Updated")
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500
      return sendError(res, status, error?.message || "Error", null)
    }
  },

  remove: async (req, res) => {
    try {
      const data = await promoVoucherService.softDelete(req.params.id)
      return sendSuccess(res, 200, data, "Deactivated")
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500
      return sendError(res, status, error?.message || "Error", null)
    }
  },
}

