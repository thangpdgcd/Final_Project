import axios from "axios";

// Cấu hình base URL cho API hồ sơ người dùng
// Ưu tiên:
//   1. VITE_API_URL (nếu dùng Vite)
//   2. REACT_APP_API_URL (nếu dùng CRA)
//   3. Mặc định: http://localhost:8080 hoặc http://localhost:8080/api
//
// Nếu biến môi trường đã chứa "/api" thì KHÔNG cộng thêm lần nữa.
const RAW_API_HOST =
  (import.meta as any).env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080/api";

const _host = String(RAW_API_HOST).replace(/\/+$/, "");
const apiBase = _host.endsWith("/api") ? _host : `${_host}/api`;

export interface UserProfile {
  user_ID: number;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export const apiProfile = async (id: string) => {
  const res = await axios.get<UserProfile>(`${apiBase}/users/${id}`);
  return res.data;
};
