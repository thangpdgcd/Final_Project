import axiosInstance from '@/services/axios';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';

const mapProduct = (p: any): Product => ({
  ...p,
  product_ID: p.product_ID ?? p.productId,
  categories_ID: p.categories_ID ?? p.categoriesId,
  user_ID: p.user_ID ?? p.userId,
});

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
    return mapProduct(res.data);
  },

  create: async (payload: CreateProductDto): Promise<Product> => {
    const res = await axiosInstance.post<any>('/create-products', payload);
    return mapProduct(res.data);
  },

  update: async (id: number, payload: UpdateProductDto): Promise<Product> => {
    const res = await axiosInstance.put<any>(`/products/${id}`, payload);
    return mapProduct(res.data);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>(`/products/${id}`);
    return res.data;
  },
};
