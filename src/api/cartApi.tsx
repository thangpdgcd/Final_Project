import axios from "axios";

// Base URL lấy từ .env
const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

/* --------- TYPES --------- */
export interface Category {
  category_ID: number;
  name: string;
  description?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

/* --------- API FUNCTIONS --------- */

// Lấy tất cả categories
export async function getAllCategories(): Promise<Category[]> {
  const res = await axios.get<Category[]>(`${apiBase}/categories`);
  return res.data;
}

// Lấy category theo ID
export async function getCategoryById(id: number): Promise<Category> {
  const res = await axios.get<Category>(`${apiBase}/categories/${id}`);
  return res.data;
}

// Tạo mới category
export async function createCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
  const res = await axios.post<Category>(`${apiBase}/categories`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật category
export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const res = await axios.put<Category>(
    `${apiBase}/categories/${id}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

// Xoá category
export async function deleteCategory(id: number): Promise<{ message: string }> {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/categories/${id}`
  );
  return res.data;
}
