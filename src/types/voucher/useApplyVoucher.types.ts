export type ApplyVoucherResult = {
  success: boolean;
  discount: number;
  finalPrice: number;
  message: string;
};

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
  applyVoucher: (args: { orderValue: number; code?: string }) => Promise<ApplyVoucherResult | null>;
  hydrateApplied: (args: {
    code?: string;
    discount?: number | null;
    finalPrice?: number | null;
    message?: string;
    success?: boolean;
  }) => void;
  reset: () => void;
};

