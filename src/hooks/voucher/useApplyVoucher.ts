import { useCallback, useMemo, useState } from 'react';
import { voucherService } from '@/services/voucher/voucher.service';
import type { UseApplyVoucherState } from '@/types/voucher/useApplyVoucher.types';

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

  const applyVoucher = useCallback(
    async ({ orderValue, code: overrideCode }: { orderValue: number; code?: string }) => {
      const nextCode = String(overrideCode ?? trimmedCode).trim();
      if (!nextCode) {
        setErrorMessage('Please enter a voucher code.');
        setIsSuccess(false);
        return null;
      }

      const ov = Number(orderValue ?? 0);
      if (!Number.isFinite(ov) || ov < 0) {
        setErrorMessage('Invalid order value. Please try again.');
        setIsSuccess(false);
        return null;
      }

      setIsApplying(true);
      setErrorMessage('');
      setMessage('');
      setIsSuccess(false);

      try {
        const res = await voucherService.apply({ code: nextCode, orderValue: ov });

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
    },
    [trimmedCode],
  );

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

