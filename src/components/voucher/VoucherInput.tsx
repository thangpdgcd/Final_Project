import React, { useMemo, useState } from 'react';

type Props = {
  code: string;
  onCodeChange: (next: string) => void;
  onApply: (trimmedCode: string) => void;
  isApplying?: boolean;
  errorMessage?: string;
  helperText?: string;
};

const VoucherInput: React.FC<Props> = ({
  code,
  onCodeChange,
  onApply,
  isApplying = false,
  errorMessage,
  helperText,
}) => {
  const [touched, setTouched] = useState(false);
  const trimmed = useMemo(() => String(code ?? '').trim(), [code]);
  const showError = Boolean(errorMessage) && (touched || trimmed.length > 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Voucher code"
          className="h-10 w-full rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] bg-[color:var(--hl-surface-lowest)] px-3 text-sm text-[color:var(--hl-on-surface)] outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={() => onApply(trimmed)}
          disabled={isApplying || !trimmed}
          className="h-10 shrink-0 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isApplying ? 'Applying…' : 'Apply'}
        </button>
      </div>

      {helperText ? (
        <p className="text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
          {helperText}
        </p>
      ) : null}

      {showError ? <p className="text-xs text-red-500">{String(errorMessage)}</p> : null}
    </div>
  );
};

export default VoucherInput;

