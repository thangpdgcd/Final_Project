import api from "./axiosInstance";

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  address?: string;
}

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
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/me");
  return res.data;
};
