import axios from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  // user
  // userId?: number;
  // email?: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(
    "http://localhost:8080/api/login",
    payload
  );
  return res.data;
}
