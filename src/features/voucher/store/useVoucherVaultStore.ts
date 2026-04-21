import { create } from 'zustand';
import api from '@/api/axiosInstances/axiosInstance';
import {
  mapDbVouchersToVault,
  mergeVouchersByCode,
  pickVoucherList,
  readVoucherVaultFromStorage,
  shouldSilentlyIgnoreVoucherFetchError,
  unwrapSuccessData,
  writeVoucherVaultToStorage,
} from '@/services/voucher/voucherVault.service';

export type VaultVoucher = {
  id: string;
  code: string;
  message?: string;
  receivedAt: number;
};

type State = {
  vouchers: VaultVoucher[];
  add: (v: { code: string; message?: string }) => void;
  remove: (id: string) => void;
  clear: () => void;
  hydrate: () => void;
};

const createId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

export const useVoucherVaultStore = create<State>((set) => ({
  vouchers: [],

  hydrate: () => {
    const items = readVoucherVaultFromStorage();
    set({ vouchers: items });

    (async () => {
      try {
        const res = await api.get('/vouchers/me');
        const raw = (res as any)?.data as unknown;
        const payload = unwrapSuccessData(raw);
        const list = pickVoucherList(payload);
        if (!Array.isArray(list) || list.length === 0) return;

        const incoming = mapDbVouchersToVault(list);
        if (incoming.length === 0) return;

        set((state) => {
          const merged = mergeVouchersByCode(state.vouchers, incoming);
          writeVoucherVaultToStorage(merged);
          return { vouchers: merged };
        });
      } catch (e) {
        if (shouldSilentlyIgnoreVoucherFetchError(e)) return;
      }
    })();
  },

  add: ({ code, message }) => {
    const normalized = String(code ?? '')
      .trim()
      .toUpperCase();
    if (!normalized) return;

    const next: VaultVoucher = {
      id: createId(),
      code: normalized,
      message: message ? String(message) : undefined,
      receivedAt: Date.now(),
    };

    set((state) => {
      const already = state.vouchers.some((v) => v.code === normalized);
      const vouchers = already ? state.vouchers : [next, ...state.vouchers];
      writeVoucherVaultToStorage(vouchers);
      return { vouchers };
    });
  },

  remove: (id) => {
    set((state) => {
      const vouchers = state.vouchers.filter((v) => v.id !== id);
      writeVoucherVaultToStorage(vouchers);
      return { vouchers };
    });
  },

  clear: () => {
    writeVoucherVaultToStorage([]);
    set({ vouchers: [] });
  },
}));

