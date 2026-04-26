import { http } from '@/api/http/http';

/**
 * Categories API:
 * - Normalizes multiple backend response shapes.
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
  name: string;
  description?: string;

  // Some backends use PascalCase keys
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

export const getAllCategories = async (): Promise<Category[]> => {
  const res = await http.get(`/categories`, {
    params: { page: 1, limit: 1000 },
  });
  const raw = extractCategoryList(res.data);
  return (Array.isArray(raw) ? raw : [])
    .map(normalizeCategory)
    .filter((c) => Number.isFinite(c.category_ID) && c.category_ID > 0);
};

export const getCategoryById = async (id: number): Promise<any> => {
  const res = await http.get(`/categories/${id}`);
  return res.data;
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<any> => {
  const res = await http.post(`/create-categories`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

export const updateCategory = async (id: number, payload: UpdateCategoryPayload): Promise<any> => {
  const res = await http.put(`/categories/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

export const deleteCategory = async (id: number): Promise<any> => {
  const res = await http.delete(`/categories/${id}`);
  return res.data;
};
