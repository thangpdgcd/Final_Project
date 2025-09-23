import axios from "axios";

// Base URL lấy từ .env
const apiBase = process.env.VITE_API_URL || "http://localhost:8080/api";

/* --------- TYPES --------- */
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

export interface CreateProductPayload {
  name: string;
  price: number;
  stock?: number;
  description?: string;
  image?: string | null;
  categories_ID: number;
  user_ID: number;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  image?: string | null;
  categories_ID?: number;
  user_ID?: number;
}

/* --------- API FUNCTIONS --------- */

// Lấy tất cả products
export async function getAllProducts(): Promise<Product[]> {
  const res = await axios.get<Product[]>(`${apiBase}/products`);
  return res.data;
}

// Tìm kiếm products theo tên
export async function searchProducts(name: string): Promise<Product[]> {
  const res = await axios.get<Product[]>(
    `${apiBase}/products?name=${encodeURIComponent(name)}`
  );
  return res.data;
}

// Lấy product theo ID
export async function getProductById(id: number): Promise<Product> {
  const res = await axios.get<Product>(`${apiBase}/products/${id}`);
  return res.data;
}

// Tạo mới product
export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const res = await axios.post<Product>(`${apiBase}/products`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Cập nhật product
export async function updateProduct(
  id: number,
  payload: UpdateProductPayload
): Promise<Product> {
  const res = await axios.put<Product>(`${apiBase}/products/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Xoá product
export async function deleteProduct(id: number): Promise<{ message: string }> {
  const res = await axios.delete<{ message: string }>(
    `${apiBase}/products/${id}`
  );
  return res.data;
}
