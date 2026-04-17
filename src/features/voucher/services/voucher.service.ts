import axios from 'axios';
import axiosInstance from '@/services/axios';

export type ApplyVoucherRequest = {
  code: string;
  orderId: string;
};

export type ApplyVoucherResponse = {
  success: boolean;
  discount: number;
  finalPrice: number;
  message: string;
};

const normalizeApplyVoucherResponse = (payload: unknown): ApplyVoucherResponse => {
  const root = payload as any;
  const data = root?.data ?? root?.result ?? root;

  const success = Boolean(data?.success ?? root?.success ?? false);
  const discount = Number(data?.discount ?? root?.discount ?? 0);
  const finalPrice = Number(data?.finalPrice ?? root?.finalPrice ?? 0);
  const message = String(data?.message ?? root?.message ?? '');

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
    const orderId = String(req.orderId ?? '').trim();

    const res = await axiosInstance.post('/voucher/apply', { code, orderId });
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

