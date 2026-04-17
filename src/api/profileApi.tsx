import api from "./axiosInstance";
import axios from "axios";

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface WalletTopupPayload {
  amountXu: number;
  paypalCaptureId: string;
  note?: string;
}

export const pickUserFromProfileResponse = (raw: unknown): Record<string, unknown> | null => {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, any>;
  const candidate =
    data.user ??
    data.data?.user ??
    data.result?.user ??
    data.profile ??
    data.data?.profile ??
    data.data ??
    data.result;
  return candidate && typeof candidate === "object" ? (candidate as Record<string, unknown>) : null;
};

export const pickAvatarUrlFromResponse = (raw: unknown): string | null => {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, any>;
  const candidate =
    data.avatarUrl ??
    data.avatarURL ??
    data.avatar ??
    data.url ??
    data.secure_url ??
    data.imageUrl ??
    data.data?.avatarUrl ??
    data.data?.avatarURL ??
    data.data?.avatar ??
    data.data?.url ??
    data.data?.secure_url ??
    data.data?.imageUrl ??
    data.data?.result?.avatarUrl ??
    data.result?.avatarUrl ??
    data.result?.avatar;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const res = await api.put("/profile", payload);
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const avatarUrl = pickAvatarUrlFromResponse(res.data);
  if (!avatarUrl) {
    throw new Error("Avatar URL missing from upload response");
  }
  return { avatarUrl, raw: res.data };
};

export const getMe = async () => {
  const candidates = ["/users/me", "/me"];
  let lastErr: unknown;
  for (const url of candidates) {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      lastErr = err;
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) continue;
        if (status === 401 || status === 403) return null;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error("ME_NOT_AVAILABLE");
};

export const getWallet = async () => {
  const WALLET_DISABLED_KEY = "wallet:get_disabled";
  const candidates = ["/wallet", "/users/wallet", "/users/me/wallet", "/wallets"];
  for (const url of candidates) {
    try {
      const res = await api.get(url);
      // Wallet endpoint works → clear any stale disable flag.
      try {
        localStorage.removeItem(WALLET_DISABLED_KEY);
      } catch {
        // ignore
      }
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) continue;
        // Do NOT permanently disable wallet on 401/403. Tokens may refresh, backend may change,
        // or the user may log in again — allow retry on next render.
        if (status === 401 || status === 403) return { walletCoin: 0, walletXu: 0 };
      }
      throw err;
    }
  }
  // Backend may not implement wallet — return a safe empty payload
  return { walletCoin: 0, walletXu: 0 };
};

export const topupWallet = async (payload: WalletTopupPayload) => {
  const res = await api.post("/wallet/topup", payload);
  return res.data;
};
