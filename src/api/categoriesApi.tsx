import axios from "axios";

/**
 * Cấu hình base URL cho API categories
 * Ưu tiên:
 *   1. VITE_API_URL (Vite)
 *   2. REACT_APP_API_URL (CRA)
 *   3. Mặc định: http://localhost:8080 hoặc http://localhost:8080/api
 *
 * Nếu biến môi trường đã chứa "/api" thì KHÔNG cộng thêm lần nữa.
 */
const RAW_API_HOST =
  (import.meta as any).env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080/api";

const _host = String(RAW_API_HOST).replace(/\/+$/, "");
const apiBase = _host.endsWith("/api") ? _host : `${_host}/api`;

/* --------- TYPES --------- */
export interface Category {
  category_ID: number;
  name: string;
  description?: string;
}

export interface CreateCategoryPayload {
  // FE dùng name/description
  name: string;
  description?: string;

  // ✅ hỗ trợ backend dùng Name/Description
  Name?: string;
  Description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;

  Name?: string;
  Description?: string;
}

/* --------- API FUNCTIONS --------- */

// Lấy tất cả categories
export async function getAllCategories(): Promise<any> {
  const res = await axios.get(`${apiBase}/categories`);
  return res.data;
}

// Lấy category theo ID
export async function getCategoryById(id: number): Promise<any> {
  const res = await axios.get(`${apiBase}/categories/${id}`);
  return res.data;
}

// Tạo mới category
export async function createCategory(
  payload: CreateCategoryPayload
): Promise<any> {
  const res = await axios.post(`${apiBase}/create-categories`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật category
export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload
): Promise<any> {
  const res = await axios.put(`${apiBase}/categories/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Xoá category
export async function deleteCategory(id: number): Promise<any> {
  const res = await axios.delete(`${apiBase}/categories/${id}`);
  return res.data;
}
