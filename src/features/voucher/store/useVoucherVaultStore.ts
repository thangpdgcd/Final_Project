import { create } from 'zustand';

export type VaultVoucher = {
  id: string;
  code: string;
  message?: string;
  receivedAt: number;
};

const STORAGE_KEY = 'customer_voucher_vault_v1';

const readStorage = (): VaultVoucher[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => ({
        id: String(x?.id ?? ''),
        code: String(x?.code ?? '').trim().toUpperCase(),
        message: x?.message != null ? String(x.message) : undefined,
        receivedAt: Number(x?.receivedAt ?? Date.now()),
      }))
      .filter((x) => x.id && x.code);
  } catch {
    return [];
  }
};

const writeStorage = (items: VaultVoucher[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
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
    const items = readStorage();
    set({ vouchers: items });
  },

  add: ({ code, message }) => {
    const normalized = String(code ?? '').trim().toUpperCase();
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
      writeStorage(vouchers);
      return { vouchers };
    });
  },

  remove: (id) => {
    set((state) => {
      const vouchers = state.vouchers.filter((v) => v.id !== id);
      writeStorage(vouchers);
      return { vouchers };
    });
  },

  clear: () => {
    writeStorage([]);
    set({ vouchers: [] });
  },
}));

