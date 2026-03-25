import axiosInstance from '@/services/axios';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';

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

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const res = await axiosInstance.get('/products');
    let list: any[] = [];
    if (Array.isArray(res.data)) list = res.data;
    else if (res.data && Array.isArray(res.data.products)) list = res.data.products;
    return list.map(mapProduct);
  },

  getById: async (id: number): Promise<Product> => {
    const res = await axiosInstance.get<any>(`/products/${id}`);
    return mapProduct(pickProductPayload(res.data));
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
