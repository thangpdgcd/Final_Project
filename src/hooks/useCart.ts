import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/features/cart/services/cart.service';
import type { AddToCartPayload } from '@/types';

export const CART_KEY = ['cart'] as const;

export const useCart = (userId: number | undefined) =>
  useQuery({
    queryKey: [...CART_KEY, userId],
    queryFn: () => cartService.getByUserId(userId!),
    enabled: !!userId && userId > 0,
  });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartService.updateItem(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cartService.removeItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};
