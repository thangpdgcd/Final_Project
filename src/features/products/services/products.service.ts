import axiosInstance from '@/services/axios';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';
import axios from 'axios';
import { getApiBaseUrl } from '@/shared/lib/http/baseUrl';

const toNumberOr = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const mapProduct = (p: any): Product => ({
  ...p,
  product_ID: toNumberOr(p?.product_ID ?? p?.productId ?? p?.id ?? p?.ID, 0),
  categories_ID: toNumberOr(p?.categories_ID ?? p?.categoriesId ?? p?.category_ID ?? p?.categoryId, 0),
  user_ID: toNumberOr(p?.user_ID ?? p?.userId ?? p?.owner_ID ?? p?.ownerId, 0),
  name: String(p?.name ?? ''),
  price: toNumberOr(p?.price, 0),
  stock: toNumberOr(p?.stock, 0),
});

const pickProductPayload = (data: any) => data?.product ?? data?.data ?? data;

const getHostBaseUrl = () => {
  const apiBase = String(getApiBaseUrl() ?? '').replace(/\/+$/, '');
  if (apiBase.endsWith('/api')) return apiBase.slice(0, -4) || '';
  return apiBase;
};

const extractProducts = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  return (
    payload?.products ??
    payload?.data?.products ??
    payload?.data ??
    payload?.rows ??
    payload?.result ??
    payload?.results ??
    payload?.items ??
    []
  );
};

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const hostBase = getHostBaseUrl();
    const urls = [
      { kind: 'api', url: '/products' },
      { kind: 'api', url: '/product' },
      { kind: 'api', url: '/all-products' },
      { kind: 'api', url: '/get-products' },
      ...(hostBase
        ? ([
            { kind: 'host', url: `${hostBase}/products` },
            { kind: 'host', url: `${hostBase}/product` },
            { kind: 'host', url: `${hostBase}/all-products` },
            { kind: 'host', url: `${hostBase}/get-products` },
          ] as const)
        : []),
    ] as const;

    let lastErr: unknown;
    for (const u of urls) {
      try {
        const res = u.kind === 'api' ? await axiosInstance.get(u.url) : await axios.get(u.url);
        const raw = extractProducts(res.data);
        const list = Array.isArray(raw) ? raw : [];
        return list.map(mapProduct).filter((p) => Number.isFinite(p.product_ID) && p.product_ID > 0);
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }

    if (axios.isAxiosError(lastErr) && lastErr.response?.status === 404) return [];
    throw lastErr ?? new Error('GET_PRODUCTS_FAILED');
  },

  getById: async (id: number): Promise<Product> => {
    const safeId = Number(id);
    const hostBase = getHostBaseUrl();
    const urls = [
      { kind: 'api', url: `/products/${safeId}` },
      { kind: 'api', url: `/product/${safeId}` },
      ...(hostBase ? ([{ kind: 'host', url: `${hostBase}/products/${safeId}` }, { kind: 'host', url: `${hostBase}/product/${safeId}` }] as const) : []),
    ] as const;

    let lastErr: unknown;
    for (const u of urls) {
      try {
        const res = u.kind === 'api' ? await axiosInstance.get<any>(u.url) : await axios.get<any>(u.url);
        return mapProduct(pickProductPayload(res.data));
      } catch (err) {
        lastErr = err;
        if (!axios.isAxiosError(err)) throw err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }

    throw lastErr ?? new Error('GET_PRODUCT_FAILED');
  },

  create: async (payload: CreateProductDto): Promise<Product> => {
    const res = await axiosInstance.post<any>('/create-products', payload);
    return mapProduct(pickProductPayload(res.data));
  },

  update: async (id: number, payload: UpdateProductDto): Promise<Product> => {
    const res = await axiosInstance.put<any>(`/products/${id}`, payload);
    return mapProduct(pickProductPayload(res.data));
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/products/${id}`);
    return res.data;
  },
};

