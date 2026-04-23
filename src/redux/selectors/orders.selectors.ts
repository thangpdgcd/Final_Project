import type { RootState } from '@/redux/store';

export const selectOrders = (s: RootState) => s.orders.items;
export const selectOrdersStatus = (s: RootState) => s.orders.status;
export const selectOrdersError = (s: RootState) => s.orders.error;
export const selectIsCreatingOrder = (s: RootState) => s.orders.creating;
export const selectLastCreatedOrderId = (s: RootState) => s.orders.lastCreatedOrderId;

