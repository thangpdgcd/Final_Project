// src/pages/systems/services/categoryservicesSystem.ts
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "../../../api/categoriesApi";

export type CategoryFormValues = {
  name: string;
  description?: string;
};

/** ✅ LẤY CATEGORY_ID TỪ MỌI KIỂU BACKEND */
export function getCategoryId(record: any): number | undefined {
  const v = record?.category_ID ?? record?.ID;
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** ✅ Normalize để UI LUÔN DÙNG category_ID, name, description */
export function normalizeCategory(record: any) {
  return {
    ...record,
    category_ID: getCategoryId(record),
    name: record?.name ?? record?.Name ?? "",
    description: record?.description ?? record?.Description ?? "",
  };
}

/** ✅ SEARCH */
export function filterCategories(categories: any[], searchText: string) {
  const kw = (searchText || "").trim().toLowerCase();
  if (!kw) return categories;

  return categories.filter((c) => {
    const cc = normalizeCategory(c);
    const id = cc.category_ID;
    const idMatch = id !== undefined ? String(id).includes(kw) : false;
    const nameMatch = cc.name.toLowerCase().includes(kw);
    return idMatch || nameMatch;
  });
}

/** ✅ PAYLOAD */
export function buildCategoryPayload(
  values: CategoryFormValues,
): CreateCategoryPayload | UpdateCategoryPayload {
  const name = values.name?.trim();
  const description = values.description?.trim();

  return {
    name,
    description: description || undefined,

    // legacy support
    Name: name,
    Description: description || undefined,
  } as any;
}

/** ✅ API */
export async function fetchCategoriesService(): Promise<any[]> {
  const data = await getAllCategories();
  const list = Array.isArray(data) ? data : (data?.categories ?? []);
  return list.map(normalizeCategory);
}

export async function createCategoryService(values: CategoryFormValues) {
  const payload = buildCategoryPayload(values) as CreateCategoryPayload;
  return createCategory(payload);
}

export async function updateCategoryService(
  categoryId: number,
  values: CategoryFormValues,
) {
  if (!Number.isFinite(categoryId)) {
    throw new Error("Invalid categoryId");
  }
  return updateCategory(categoryId, buildCategoryPayload(values));
}

export async function deleteCategoryService(categoryId: number) {
  if (!Number.isFinite(categoryId)) {
    throw new Error("Invalid categoryId");
  }
  return deleteCategory(categoryId);
}

export function toCategoryFormValues(record: any): CategoryFormValues {
  const c = normalizeCategory(record);
  return {
    name: c.name,
    description: c.description,
  };
}
