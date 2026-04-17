import { useCallback, useMemo, useState } from 'react';
import { voucherService } from '@/features/voucher/services/voucher.service';

export type UseApplyVoucherState = {
  code: string;
  setCode: (v: string) => void;
  trimmedCode: string;
  isApplying: boolean;
  errorMessage: string;
  message: string;
  discount: number | null;
  finalPrice: number | null;
  isSuccess: boolean;
  applyVoucher: (args: { orderId: string; code?: string }) => Promise<{
    success: boolean;
    discount: number;
    finalPrice: number;
    message: string;
  } | null>;
  reset: () => void;
};

export const useApplyVoucher = (): UseApplyVoucherState => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [discount, setDiscount] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const trimmedCode = useMemo(() => code.trim(), [code]);

  const reset = useCallback(() => {
    setErrorMessage('');
    setMessage('');
    setDiscount(null);
    setFinalPrice(null);
    setIsSuccess(false);
  }, []);

  const applyVoucher = useCallback(async ({ orderId, code: overrideCode }: { orderId: string; code?: string }) => {
    const nextCode = String(overrideCode ?? trimmedCode).trim();
    if (!nextCode) {
      setErrorMessage('Please enter a voucher code.');
      setIsSuccess(false);
      return null;
    }

    const safeOrderId = String(orderId ?? '').trim();
    if (!safeOrderId) {
      setErrorMessage('Missing order id. Please try again.');
      setIsSuccess(false);
      return null;
    }

    setIsApplying(true);
    setErrorMessage('');
    setMessage('');
    setIsSuccess(false);

    try {
      const res = await voucherService.apply({ code: nextCode, orderId: safeOrderId });

      setMessage(res.message || (res.success ? 'Voucher applied.' : 'Could not apply voucher.'));
      setDiscount(res.discount);
      setFinalPrice(res.finalPrice);
      setIsSuccess(Boolean(res.success));

      return res;
    } catch (err) {
      setErrorMessage(voucherService.getErrorMessage(err));
      setIsSuccess(false);
      return null;
    } finally {
      setIsApplying(false);
    }
  }, [trimmedCode]);

  return {
    code,
    setCode,
    trimmedCode,
    isApplying,
    errorMessage,
    message,
    discount,
    finalPrice,
    isSuccess,
    applyVoucher,
    reset,
  };
};

