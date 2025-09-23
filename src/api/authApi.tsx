import axios from "axios";

const apilogin = process.env.API_URL_LOGIN || "http://localhost:8080/api/login";
const apiregister =
  process.env.API_URL_REGISTER || "http://localhost:8080/api/register";

// Kiểu dữ liệu
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  roleID?: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
}

// 🔹 Login API (POST)
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await axios.post(`${apilogin}`, payload);
  return res.data;
};

// 🔹 Register API (POST)
export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await axios.post(`${apiregister}`, payload);
  return res.data;
};
