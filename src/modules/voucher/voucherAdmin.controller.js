import { sendSuccess, sendError } from "../../utils/response.js";
import { createVoucherAdminService } from "./voucherAdmin.service.js";

const service = createVoucherAdminService();

export const voucherAdminController = {
  list: async (req, res) => {
    try {
      const data = await service.listVouchers(req.query ?? {});
      return sendSuccess(res, 200, data, "OK");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  },

  create: async (req, res) => {
    try {
      const body = req.body ?? {};
      const created = await service.createVoucher({
        code: body.code,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        max_usage: body.max_usage,
        expired_at: body.expired_at,
        user_id: body.user_id,
        record_status: body.record_status,
        staffId: req.user?.id,
      });
      return sendSuccess(res, 201, created, "Voucher created");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body ?? {};
      const updated = await service.updateVoucher({
        id,
        staffId: req.user?.id,
        patch: {
          code: body.code,
          discount_type: body.discount_type,
          discount_value: body.discount_value,
          max_usage: body.max_usage,
          expired_at: body.expired_at ?? body.expires_at,
          record_status: body.record_status,
          user_id: body.user_id,
        },
      });
      return sendSuccess(res, 200, updated, "Voucher updated");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      await service.softDeleteVoucher({ id });
      return sendSuccess(res, 200, { id: Number(id) }, "Voucher deactivated");
    } catch (error) {
      const status = Number(error?.statusCode || error?.status) || 500;
      return sendError(res, status, error?.message || "Error", null);
    }
  },
};
