import { useEffect, useState } from 'react';
import { staffApi } from '../api/staff.api';
import type { OnlineStaffUser } from '../types';

type Options = {
  enabled: boolean;
  pollMs?: number;
};

export const useOnlineStaff = ({ enabled, pollMs = 15_000 }: Options) => {
  const [staff, setStaff] = useState<OnlineStaffUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const list = await staffApi.getOnlineStaff();
        if (cancelled) return;
        setStaff(list);
      } catch {
        // silent: avoid spamming users if staff endpoint fails intermittently
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    timer = setInterval(() => {
      void load();
    }, pollMs);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [enabled, pollMs]);

  return { staff, loading };
};
