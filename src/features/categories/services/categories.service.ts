import axiosInstance from '@/services/axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';
import axios from 'axios';
import { getApiBaseUrl } from '@/shared/lib/http/baseUrl';

const normalizeCategory = (record: Record<string, unknown>): Category => ({
  category_ID: Number(record?.category_ID ?? record?.categoriesId ?? record?.ID ?? record?.id ?? 0),
  name: String(record?.name ?? record?.Name ?? ''),
  description: (record?.description ?? record?.Description) as string | undefined,
});

const getHostBaseUrl = () => {
  const apiBase = String(getApiBaseUrl() ?? '').replace(/\/+$/, '');
  if (apiBase.endsWith('/api')) return apiBase.slice(0, -4) || '';
  return apiBase;
};

const extractCategories = (payload: any): any[] => {
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

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const hostBase = getHostBaseUrl();
    const urls = [
      { kind: 'api', url: '/categories' },
      { kind: 'api', url: '/category' },
      { kind: 'api', url: '/all-categories' },
      { kind: 'api', url: '/get-categories' },
      ...(hostBase
        ? ([
            { kind: 'host', url: `${hostBase}/categories` },
            { kind: 'host', url: `${hostBase}/category` },
            { kind: 'host', url: `${hostBase}/all-categories` },
            { kind: 'host', url: `${hostBase}/get-categories` },
          ] as const)
        : []),
    ] as const;

    let lastErr: unknown;
    for (const u of urls) {
      try {
        const res = u.kind === 'api' ? await axiosInstance.get(u.url) : await axios.get(u.url);
        const raw = extractCategories(res.data);
        return (Array.isArray(raw) ? raw : [])
          .map((r) => normalizeCategory(r as any))
          .filter((c) => Number.isFinite(c.category_ID) && c.category_ID > 0);
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }

    if (axios.isAxiosError(lastErr) && lastErr.response?.status === 404) return [];
    throw lastErr ?? new Error('GET_CATEGORIES_FAILED');
  },

  getById: async (id: number): Promise<Category> => {
    const safeId = Number(id);
    const hostBase = getHostBaseUrl();
    const urls = [
      { kind: 'api', url: `/categories/${safeId}` },
      { kind: 'api', url: `/category/${safeId}` },
      ...(hostBase
        ? ([
            { kind: 'host', url: `${hostBase}/categories/${safeId}` },
            { kind: 'host', url: `${hostBase}/category/${safeId}` },
          ] as const)
        : []),
    ] as const;

    let lastErr: unknown;
    for (const u of urls) {
      try {
        const res =
          u.kind === 'api' ? await axiosInstance.get<any>(u.url) : await axios.get<any>(u.url);
        return normalizeCategory((res.data as any)?.data ?? res.data);
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }

    throw lastErr ?? new Error('GET_CATEGORY_FAILED');
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
