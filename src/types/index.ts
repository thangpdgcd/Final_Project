// ─── Generic API Response Types ───────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  roleID?: string;
}

export interface AuthUser {
  user_ID: number;
  name: string;
  email: string;
  roleID: number | string;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  walletXu?: number;
}

export interface LoginResponse {
  token: string;
  user?: AuthUser;
}

export interface RegisterResponse {
  userId: number;
  email: string;
}

// ─── Product Types ────────────────────────────────────────────────────────────
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

export type CreateProductDto = Omit<Product, 'product_ID'>;
export type UpdateProductDto = Partial<CreateProductDto>;

// ─── Category Types ───────────────────────────────────────────────────────────
export interface Category {
  category_ID: number;
  name: string;
  description?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  Name?: string;
  Description?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// ─── Cart Types ───────────────────────────────────────────────────────────────
export interface CartProduct {
  name: string;
  price: number;
  image?: string;
}

export interface CartItem {
  cartitem_ID: number;
  cart_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  products?: CartProduct;
}

export interface AddToCartPayload {
  user_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
}

export interface AddToCartResponse {
  message?: string;
  data?: CartItem;
}

// ─── Order Types ──────────────────────────────────────────────────────────────
export interface Order {
  order_ID: number;
  user_ID: number;
  total_Amount: number;
  status?: string;
  shipping_Address?: string;
  paymentMethod?: string;
  paypalCaptureId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  user_ID: number;
  total_Amount?: number;
  status?: string;
  shipping_Address?: string;
  paymentMethod?: string;
  paypalCaptureId?: string | null;
}

export interface OrderItem {
  orderitem_ID: number;
  order_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItemPayload {
  order_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
}

// ─── User Types ───────────────────────────────────────────────────────────────
export interface User {
  user_ID: number;
  name: string;
  email: string;
  roleID: number | string;
  phoneNumber?: string;
  address?: string;
  walletXu?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  roleID: number;
}

export type UpdateUserPayload = Partial<User>;

// ─── Sort / Filter Types ──────────────────────────────────────────────────────
export type SortKey = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export type CategoryFilter = number | 'all';
