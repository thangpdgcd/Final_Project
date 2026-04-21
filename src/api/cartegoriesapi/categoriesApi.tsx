import { http } from '@/api/http/http';

/**
 * Cấu hình base URL cho API categories
 * Ưu tiên:
 *   1. VITE_API_URL (Vite)
 *   2. REACT_APP_API_URL (CRA)
 *   3. Mặc định: http://localhost:8080 hoặc http://localhost:8080/api
 *
 * Nếu biến môi trường đã chứa "/api" thì KHÔNG cộng thêm lần nữa.
 */
/* --------- TYPES --------- */
export interface Category {
  category_ID: number;
  name: string;
  description?: string;
}

const normalizeCategory = (record: any): Category => ({
  category_ID: Number(
    record?.category_ID ??
      record?.categories_ID ??
      record?.categoriesId ??
      record?.categoryId ??
      record?.ID ??
      record?.id ??
      0,
  ),
  name: String(record?.name ?? record?.Name ?? ''),
  description: (record?.description ?? record?.Description) as string | undefined,
});

const extractCategoryList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  return (
    payload?.categories ??
    payload?.data?.categories ??
    payload?.data?.items ??
    payload?.items ??
    payload?.results ??
    payload?.docs ??
    payload?.data ??
    payload?.rows ??
    []
  );
};

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
export const getAllCategories = async (): Promise<Category[]> => {
  const res = await http.get(`/categories`, {
    params: { page: 1, limit: 1000 },
  });
  const raw = extractCategoryList(res.data);
  return (Array.isArray(raw) ? raw : [])
    .map(normalizeCategory)
    .filter((c) => Number.isFinite(c.category_ID) && c.category_ID > 0);
};

// Lấy category theo ID
export const getCategoryById = async (id: number): Promise<any> => {
  const res = await http.get(`/categories/${id}`);
  return res.data;
};

// Tạo mới category
export const createCategory = async (payload: CreateCategoryPayload): Promise<any> => {
  const res = await http.post(`/create-categories`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Cập nhật category
export const updateCategory = async (id: number, payload: UpdateCategoryPayload): Promise<any> => {
  const res = await http.put(`/categories/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Xoá category
export const deleteCategory = async (id: number): Promise<any> => {
  const res = await http.delete(`/categories/${id}`);
  return res.data;
};
