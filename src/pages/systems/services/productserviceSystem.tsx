import axios from "axios";

/**
 * ✅ VITE ENV (Vite phải dùng import.meta.env)
 * .env:
 *   VITE_API_URL=http://localhost:8080
 *
 * Backend thường mount:
 *   app.use("/api", router)
 * => base sẽ là: http://localhost:8080/api
 */
const API_HOST =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";
const apiBase = `${String(API_HOST).replace(/\/$/, "")}/api`;

/* ================= TYPES ================= */
export interface Product {
  product_ID: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string; // base64 thuần hoặc dataURL
  categories_ID: number;
  user_ID: number;
}

export type CreateProductPayload = Omit<Product, "product_ID">;
export type UpdateProductPayload = Partial<Omit<Product, "product_ID">>;

/* ================= HELPERS ================= */
function normalizeProducts(data: any): Product[] {
  // backend có thể trả [] hoặc {products: []}
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * ✅ Hiển thị ảnh:
 * - Nếu backend trả base64 thuần => convert thành dataURL
 * - Nếu đã là data:image/... => giữ
 * - Nếu là URL http(s) => giữ
 */
export function getImageSrc(img?: string | null): string {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (!v) return "/no-image.png";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/jpeg;base64,${v}`;
}

/* ================= API ================= */

// GET /api/products
export async function getAllProducts(): Promise<Product[]> {
  const res = await axios.get(`${apiBase}/products`);
  return normalizeProducts(res.data);
}

// GET /api/products/:id
export async function getProductById(id: number): Promise<Product> {
  const res = await axios.get(`${apiBase}/products/${id}`);
  return (res.data?.product ?? res.data) as Product;
}

// POST /api/products
export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const res = await axios.post(`${apiBase}/products`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return (res.data?.product ?? res.data) as Product;
}

// PUT /api/products/:id
export async function updateProduct(
  id: number,
  payload: UpdateProductPayload
): Promise<Product> {
  const res = await axios.put(`${apiBase}/products/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return (res.data?.product ?? res.data) as Product;
}

// DELETE /api/products/:id
export async function deleteProduct(id: number): Promise<{ message: string }> {
  const res = await axios.delete(`${apiBase}/products/${id}`);
  return res.data;
}
