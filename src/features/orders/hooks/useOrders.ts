import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders.service';
import type { CreateOrderPayload } from '@/types';

export const ORDERS_KEY = ['orders'] as const;

export const useOrders = () =>
  useQuery({
    queryKey: ORDERS_KEY,
    queryFn: ordersService.getAll,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
};

