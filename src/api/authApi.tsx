import axios from "axios";

const apilogin = process.env.API_URL_LOGIN || "http://localhost:8080/api/login";
const apiregister =
  process.env.API_URL_REGISTER || "http://localhost:8080/api/register";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // Backend also returns the logged-in user object (shape may vary)
  user?: any;
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

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await axios.post(`${apilogin}`, payload);
  return res.data;
};

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await axios.post(`${apiregister}`, payload);
  return res.data;
};
