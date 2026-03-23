import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/features/categories/services/categories.service';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/types';

export const CATEGORIES_KEY = ['categories'] as const;

export const useCategories = () =>
  useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesService.getAll,
    staleTime: 1000 * 60 * 10, // 10 min
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryDto) => categoriesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryDto }) =>
      categoriesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};
