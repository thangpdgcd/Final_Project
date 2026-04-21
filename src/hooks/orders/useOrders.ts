import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders/orders.service';
import type { CreateOrderPayload } from '@/types/index';
import { connectSocket } from '@/features/chat/socket/socketClient';

export const ORDERS_KEY = ['orders'] as const;

type UseOrdersOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
};

const useOrdersRealtime = (enabled: boolean) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const socket = connectSocket();
    if (!socket) return;

    let timer: number | null = null;
    const schedule = () => {
      if (timer != null) return;
      timer = window.setTimeout(() => {
        timer = null;
        qc.invalidateQueries({ queryKey: ORDERS_KEY });
      }, 350);
    };

    const onOrderEvent = () => schedule();

    // Backend emits these events to the current user's room and/or staff room.
    socket.on('order:new', onOrderEvent);
    socket.on('order:update', onOrderEvent);
    socket.on('order_updated', onOrderEvent);
    socket.on('order_cancelled', onOrderEvent);
    socket.on('order_completed', onOrderEvent);

    return () => {
      if (timer != null) window.clearTimeout(timer);
      socket.off('order:new', onOrderEvent);
      socket.off('order:update', onOrderEvent);
      socket.off('order_updated', onOrderEvent);
      socket.off('order_cancelled', onOrderEvent);
      socket.off('order_completed', onOrderEvent);
    };
  }, [enabled, qc]);
};

export const useOrders = (options?: UseOrdersOptions) => {
  const enabled = options?.enabled ?? true;
  useOrdersRealtime(enabled);
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: ordersService.getAll,
    enabled,
    refetchInterval: options?.refetchInterval ?? false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
};

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

