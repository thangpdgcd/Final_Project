import axios from "axios";

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
  image?: string;
  categories_ID: number;
  user_ID: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  product_ID: number;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await axios.get<Product[]>("http://localhost:8080/api/products");
  return res.data;
}

export async function searchProducts(name: string): Promise<Product[]> {
  const res = await axios.get<Product[]>(
    `http://localhost:8080/api/products?name=${encodeURIComponent(name)}`
  );
  return res.data;
}

export async function getProductById(id: number): Promise<Product> {
  const res = await axios.get<Product>(
    `http://localhost:8080/api/products/${id}`
  );
  return res.data;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<ApiResponse<Product>> {
  const res = await axios.post<ApiResponse<Product>>(
    "http://localhost:8080/api/products",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

export async function updateProduct(
  payload: UpdateProductPayload
): Promise<ApiResponse<Product>> {
  const res = await axios.put<ApiResponse<Product>>(
    `http://localhost:8080/api/products/${payload.product_ID}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

// Xóa sản phẩm
export async function deleteProduct(id: number): Promise<ApiResponse<null>> {
  const res = await axios.delete<ApiResponse<null>>(
    `http://localhost:8080/api/products/${id}`
  );
  return res.data;
}
