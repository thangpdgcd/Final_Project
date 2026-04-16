import axiosInstance from '@/services/axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

const normalizeCategory = (record: Record<string, unknown>): Category => ({
  category_ID: Number(record?.category_ID ?? record?.categoriesId ?? record?.ID ?? record?.id ?? 0),
  name: String(record?.name ?? record?.Name ?? ''),
  description: (record?.description ?? record?.Description) as string | undefined,
});

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const res = await axiosInstance.get('/categories');
    const raw =
      Array.isArray(res.data)
        ? res.data
        : (res.data?.categories ??
          res.data?.data?.categories ??
          res.data?.data ??
          res.data?.rows ??
          []);
    return (Array.isArray(raw) ? raw : [])
      .map(normalizeCategory)
      .filter((c) => Number.isFinite(c.category_ID) && c.category_ID > 0);
  },

  getById: async (id: number): Promise<Category> => {
    const res = await axiosInstance.get<any>(`/categories/${id}`);
    return normalizeCategory(res.data);
  },

  create: async (payload: CreateCategoryDto): Promise<Category> => {
    const res = await axiosInstance.post<any>('/create-categories', payload);
    return normalizeCategory(res.data);
  },

  update: async (id: number, payload: UpdateCategoryDto): Promise<Category> => {
    const res = await axiosInstance.put<any>(`/categories/${id}`, payload);
    return normalizeCategory(res.data);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};

