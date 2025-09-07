import axios from "axios";

// =======================
// Login
// =======================
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const res = await axios.post<LoginResponse>(
      "http://localhost:8080/api/login",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err: any) {
    // Nếu server trả lỗi, err.response.data.message có thể có thông báo
    const msg =
      (err.response && err.response.data && err.response.data.message) ||
      "Lỗi đăng nhập";
    throw new Error(msg);
  }
}

// =======================
// Register
// =======================
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const res = await axios.post<RegisterResponse>(
      "http://localhost:8080/api/register",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err: any) {
    const msg =
      (err.response && err.response.data && err.response.data.message) ||
      "Lỗi đăng ký";
    throw new Error(msg);
  }
}
