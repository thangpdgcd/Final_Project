// src/pages/systems/services/categoryservicesSystem.ts
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "../../../api/categoriesApi";

// UI form type
export type CategoryFormValues = {
  name: string;
  description?: string;
};

/** ✅ lấy ID từ mọi kiểu backend trả về */
export function getCategoryId(record: any): number | undefined {
  const v =
    record?.category_ID ??
    record?.categoryId ??
    record?.categories_ID ??
    record?.category_id ??
    record?.id;

  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** ✅ Normalize record để UI luôn dùng name/description */
export function normalizeCategory(record: any) {
  return {
    ...record,
    category_ID: getCategoryId(record),
    name: record?.name ?? record?.Name ?? "",
    description: record?.description ?? record?.Description ?? "",
  };
}

// Search helper
export function filterCategories(categories: any[], searchText: string) {
  const kw = (searchText || "").trim().toLowerCase();
  if (!kw) return categories;

  return categories.filter((c) => {
    const cc = normalizeCategory(c);
    const id = cc.category_ID;
    const idMatch = id !== undefined ? String(id).includes(kw) : false;
    const nameMatch = String(cc.name || "")
      .toLowerCase()
      .includes(kw);
    return idMatch || nameMatch;
  });
}

/**
 * ✅ Build payload ĐÚNG theo backend của bạn:
 * backend createCategories đọc: let { name, description } = data;
 * => FE PHẢI gửi name/description (lowercase)
 *
 * (Mình vẫn thêm Name/Description để phòng trường hợp có route khác dùng uppercase,
 * nhưng quan trọng là phải có name để create không bị 400.)
 */
export function buildCategoryPayload(
  values: CategoryFormValues
): CreateCategoryPayload | UpdateCategoryPayload {
  const name = values.name?.trim();
  const description = values.description?.trim();

  return {
    name, // ✅ bắt buộc để backend create nhận được
    description: description ? description : undefined,

    // optional hỗ trợ legacy
    Name: name,
    Description: description ? description : undefined,
  } as any;
}

// API wrappers
export async function fetchCategoriesService(): Promise<any[]> {
  const data = await getAllCategories();
  const list = Array.isArray(data) ? data : data?.categories ?? [];
  return Array.isArray(list) ? list.map(normalizeCategory) : [];
}

export async function createCategoryService(values: CategoryFormValues) {
  const payload = buildCategoryPayload(values) as CreateCategoryPayload;
  return createCategory(payload);
}

export async function updateCategoryService(
  categoryId: number,
  values: CategoryFormValues
) {
  if (!Number.isFinite(Number(categoryId))) {
    throw new Error("updateCategoryService: invalid categoryId");
  }
  const payload = buildCategoryPayload(values) as UpdateCategoryPayload;
  return updateCategory(Number(categoryId), payload);
}

export async function deleteCategoryService(categoryId: number) {
  if (!Number.isFinite(Number(categoryId))) {
    throw new Error("deleteCategoryService: invalid categoryId");
  }
  return deleteCategory(Number(categoryId));
}

// Form mapper (edit -> setFieldsValue)
export function toCategoryFormValues(record: any): CategoryFormValues {
  const c = normalizeCategory(record);
  return {
    name: c.name ?? "",
    description: c.description ?? "",
  };
}
