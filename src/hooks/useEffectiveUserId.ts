import { useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';

export const useEffectiveUserId = (): number | undefined => {
  const { user } = useAuth();

  return useMemo(() => {
    const fromContext = Number(user?.user_ID);
    if (Number.isFinite(fromContext) && fromContext > 0) return fromContext;

    const raw = localStorage.getItem('user_ID');
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;

    return undefined;
  }, [user?.user_ID]);
};
