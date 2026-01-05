import axios from "axios";

// ✅ Vite dùng import.meta.env (process.env sẽ undefined)
const apiBase =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api";

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
export async function getAllProducts(): Promise<Product[]> {
  const res = await axios.get(`${apiBase}/products`);
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.products)) return res.data.products;
  return [];
}

/** GET: /api/products/:id */
export async function getProductById(id: number): Promise<Product> {
  const res = await axios.get(`${apiBase}/products/${id}`);
  return res.data;
}

/** ✅ POST: /api/create-products  (đúng theo route backend) */
export async function createProduct(
  payload: Omit<Product, "product_ID">
): Promise<Product> {
  const res = await axios.post(`${apiBase}/create-products`, payload);
  return res.data;
}

/** PUT: /api/products/:id */
export async function updateProduct(
  id: number,
  payload: Partial<Product>
): Promise<Product> {
  const res = await axios.put(`${apiBase}/products/${id}`, payload);
  return res.data;
}

/** DELETE: /api/products/:id */
export async function deleteProduct(id: number): Promise<{ message: string }> {
  const res = await axios.delete(`${apiBase}/products/${id}`);
  return res.data;
}
