import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import type { AddToCartPayload, CartItem } from '@/types';

export const CART_KEY = ['cart'] as const;

export const useCart = (userId: number | undefined) =>
  useQuery({
    queryKey: [...CART_KEY, userId],
    queryFn: () => cartService.getByUserId(userId!),
    enabled: !!userId && userId > 0,
    // Giỏ lưu trên server — luôn ưu tiên dữ liệu mới sau refresh / đổi tab
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
  });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: async (response, variables) => {
      await qc.invalidateQueries({ queryKey: CART_KEY });
      const uid = Number(variables.user_ID);
      if (!Number.isFinite(uid) || uid <= 0) return;
      const fromServer = response?.data;
      const rows = qc.getQueryData<CartItem[]>([...CART_KEY, uid]) ?? [];
      if (rows.length > 0 || !fromServer) return;
      try {
        localStorage.removeItem('cart:get_disabled');
      } catch {
        // ignore
      }
      qc.setQueryData([...CART_KEY, uid], [fromServer]);
    },
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
