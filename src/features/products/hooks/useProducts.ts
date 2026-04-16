import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import type { CreateProductDto, UpdateProductDto } from '@/types';

export const PRODUCTS_KEY = ['products'] as const;

export const useProducts = () =>
  useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: productsService.getAll,
    staleTime: 1000 * 60 * 5, // 5 min
  });

export const useProduct = (id: number | undefined) =>
  useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productsService.getById(id!),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductDto) => productsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductDto }) =>
      productsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

