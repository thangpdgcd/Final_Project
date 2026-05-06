import React from 'react';
import { motion } from 'framer-motion';
import { Copy, ShoppingCart, TicketPercent, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoucherVaultStore } from '@/features/voucher/store/useVoucherVaultStore';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themes/ThemeContext';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';

const formatTime = (ms: number) => {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '';
  }
};

const VoucherVaultPage = () => {
  const navigate = useNavigate();
  useDocumentTitle('pages.vouchers.documentTitle');
  const { t } = useTranslation();
  const { dark } = useTheme();
  const vouchers = useVoucherVaultStore((s) => s.vouchers);
  const hydrate = useVoucherVaultStore((s) => s.hydrate);
  const remove = useVoucherVaultStore((s) => s.remove);
  const clear = useVoucherVaultStore((s) => s.clear);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div
      className={[
        'min-h-screen',
        dark
          ? 'bg-gradient-to-br from-[#0b0b10] via-[#101018] to-[#140b05] text-white'
          : 'bg-gradient-to-br from-orange-50 via-white to-amber-50 text-slate-900',
      ].join(' ')}
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
                <TicketPercent className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t('profile.sidebar.vouchers')}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-700"
            >
              {t('vouchers.goToCart')}
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/20"
            >
              {t('vouchers.clearAll')}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {vouchers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-700 dark:text-white/85">
                {t('vouchers.emptyTitle')}
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-white/50">
                {t('vouchers.emptySubtitle')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {vouchers.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
                        {v.code}
                      </code>
                      <span className="text-xs text-slate-400">
                        {t('vouchers.receivedAt', { time: formatTime(v.receivedAt) })}
                      </span>
                    </div>
                    {v.message && <div className="mt-2 text-sm text-slate-600">{v.message}</div>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem('checkout_voucher_code', v.code);
                        } catch {
                          // ignore
                        }
                        navigate(`/cart?voucher=${encodeURIComponent(v.code)}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t('vouchers.useInCart')}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(v.code);
                        } catch {
                          // ignore
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/20"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(v.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-200 hover:text-red-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-red-500/40"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('common.delete')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherVaultPage;
