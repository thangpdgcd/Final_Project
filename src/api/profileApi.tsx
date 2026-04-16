import api from "./axiosInstance";

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
  const res = await api.get("/me");
  return res.data;
};

export const getWallet = async () => {
  const res = await api.get("/wallet");
  return res.data;
};

export const topupWallet = async (payload: WalletTopupPayload) => {
  const res = await api.post("/wallet/topup", payload);
  return res.data;
};
