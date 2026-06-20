import { config } from './config';

export interface StatsResponse {
  totalUsers: number;
}

export async function fetchStats(signal?: AbortSignal): Promise<StatsResponse> {
  if (!config.apiBaseUrl) {
    return { totalUsers: 0 };
  }
  const res = await fetch(`${config.apiBaseUrl}/stats`, { signal });
  if (!res.ok) throw new Error(`GET /stats → ${res.status}`);
  return (await res.json()) as StatsResponse;
}
