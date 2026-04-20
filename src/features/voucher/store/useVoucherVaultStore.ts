import { create } from 'zustand';
import api from '@/api/axiosInstance';
import axios from 'axios';

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
        code: String(x?.code ?? '')
          .trim()
          .toUpperCase(),
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

const unwrapSuccessData = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw;
  const root = raw as Record<string, unknown>;
  const direct = root.data;
  // backend `sendSuccess` often returns: { success, message, data }
  // but sometimes we may already get axios' `.data` which is the root.
  if (direct && typeof direct === 'object') {
    const inner = direct as Record<string, unknown>;
    // some wrappers nest again: { success, message, data: { ... } }
    if ('data' in inner && inner.data && typeof inner.data === 'object') return inner.data;
    return direct;
  }
  return raw;
};

const pickVoucherList = (payload: unknown): unknown[] => {
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as any;
  const candidates = [
    p?.vouchers,
    p?.items,
    p?.rows,
    p?.data?.vouchers,
    p?.data?.items,
    p?.data?.rows,
    p?.result?.vouchers,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
};

const mergeByCode = (base: VaultVoucher[], incoming: VaultVoucher[]) => {
  const map = new Map(base.map((v) => [v.code, v]));
  for (const v of incoming) {
    if (!v?.code) continue;
    if (!map.has(v.code)) map.set(v.code, v);
  }
  return Array.from(map.values()).sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0));
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

    // Also hydrate from backend so vouchers created/sent by staff appear for the user
    // even if chat didn't deliver a text code message.
    (async () => {
      try {
        const res = await api.get('/vouchers/me');
        const raw = (res as any)?.data as unknown;
        const payload = unwrapSuccessData(raw);
        const list = pickVoucherList(payload);
        if (!Array.isArray(list) || list.length === 0) return;

        const incoming: VaultVoucher[] = list
          .map((x: any) => ({
            id: String(x?.id ?? ''),
            code: String(x?.code ?? '')
              .trim()
              .toUpperCase(),
            message: undefined,
            receivedAt: Number(new Date(x?.createdAt ?? x?.created_at ?? Date.now()).getTime()),
          }))
          .filter((x) => x.id && x.code);

        if (incoming.length === 0) return;
        set((state) => {
          const merged = mergeByCode(state.vouchers, incoming);
          writeStorage(merged);
          return { vouchers: merged };
        });
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          if (status === 401) return; // silently ignore not logged in
          if (status === 403) return; // silently ignore forbidden
        }
        // ignore all other errors (best-effort hydration)
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
