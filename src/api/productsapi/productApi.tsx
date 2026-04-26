import { http } from '@/api/http/http';

export interface Product {
  product_ID: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  categories_ID: number;
  user_ID: number;
}

/** GET: /api/products */
export const getAllProducts = async (): Promise<Product[]> => {
  const res = await http.get(`/products`);
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.products)) return res.data.products;
  return [];
};

/** GET: /api/products/:id */
export const getProductById = async (id: number): Promise<Product> => {
  const res = await http.get(`/products/${id}`);
  return res.data;
};

/** POST: /api/create-products (backend route) */
export const createProduct = async (payload: Omit<Product, 'product_ID'>): Promise<Product> => {
  const res = await http.post(`/create-products`, payload);
  return res.data;
};

/** PUT: /api/products/:id */
export const updateProduct = async (id: number, payload: Partial<Product>): Promise<Product> => {
  const res = await http.put(`/products/${id}`, payload);
  return res.data;
};

/** DELETE: /api/products/:id */
export const deleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await http.delete(`/products/${id}`);
  return res.data;
};
