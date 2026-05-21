import { useEffect, useState } from 'react';
import { fetchStats } from '@/api/stats';

const POLL_INTERVAL_MS = 60_000;

export function useStats(): { totalUsers: number | null; error: string | null } {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    const ctrl = new AbortController();

    async function tick() {
      try {
        const data = await fetchStats(ctrl.signal);
        if (!cancelled) {
          setTotalUsers(data.totalUsers);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if ((err as { name?: string })?.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      }
    }

    tick();
    timer = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      ctrl.abort();
      if (timer) clearInterval(timer);
    };
  }, []);

  return { totalUsers, error };
}
