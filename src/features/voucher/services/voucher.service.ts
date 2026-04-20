import axios from 'axios';
import axiosInstance from '@/services/axios';

export type ApplyVoucherRequest = {
  code: string;
  orderValue: number;
};

export type ApplyVoucherResponse = {
  success: boolean;
  discount: number;
  finalPrice: number;
  message: string;
};

const normalizeApplyVoucherResponse = (payload: unknown): ApplyVoucherResponse => {
  const root = payload as any;
  // backend `sendSuccess(res, 200, data, "OK")` → { success, message, data }
  const data = root?.data ?? root?.result ?? root;
  const inner = data?.data ?? data;

  const success = Boolean(data?.success ?? root?.success ?? false);
  const discount = Number(inner?.discountAmount ?? inner?.discount ?? 0);
  const finalPrice = Number(inner?.finalPrice ?? 0);
  const message = String(data?.message ?? inner?.message ?? root?.message ?? '');

  return {
    success,
    discount: Number.isFinite(discount) ? discount : 0,
    finalPrice: Number.isFinite(finalPrice) ? finalPrice : 0,
    message,
  };
};

export const voucherService = {
  apply: async (req: ApplyVoucherRequest): Promise<ApplyVoucherResponse> => {
    const code = String(req.code ?? '').trim();
    const orderValue = Number(req.orderValue ?? 0);
    const safeOrderValue = Number.isFinite(orderValue) ? orderValue : 0;

    const res = await axiosInstance.post('/vouchers/apply', { code, orderValue: safeOrderValue });
    return normalizeApplyVoucherResponse(res.data);
  },

  getErrorMessage: (error: unknown): string => {
    if (!axios.isAxiosError(error)) return 'Could not apply voucher. Please try again.';

    const data = error.response?.data as any;
    const msg =
      data?.message ??
      data?.error ??
      data?.data?.message ??
      data?.result?.message ??
      (typeof data === 'string' ? data : null);

    return String(msg ?? 'Could not apply voucher. Please try again.').trim();
  },
};
