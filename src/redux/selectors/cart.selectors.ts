import type { RootState } from '@/redux/store';

export const selectCartState = (s: RootState) => s.cart;

export const selectCartItemsByUserId = (s: RootState, userId: number | undefined | null) => {
  const uid = Number(userId ?? 0);
  if (!Number.isFinite(uid) || uid <= 0) return [];
  return s.cart.itemsByUserId[uid] ?? [];
};

export const selectCartStatusByUserId = (s: RootState, userId: number | undefined | null) => {
  const uid = Number(userId ?? 0);
  if (!Number.isFinite(uid) || uid <= 0) return 'idle' as const;
  return s.cart.statusByUserId[uid] ?? ('idle' as const);
};

export const selectCartCount = (s: RootState, userId: number | undefined | null) =>
  selectCartItemsByUserId(s, userId).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

